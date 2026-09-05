import { readFileSync } from "node:fs";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";

import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";

import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

let testEnv;

const PROJECT_ID = "movie-night-matcher-test";

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

async function createTestRoom() {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await setDoc(doc(db, "rooms/ABC123"), {
      hostUid: "host1",
      status: "lobby",
      matchMode: "strict",
      members: {
        host1: {
          displayName: "Host",
        },
        user2: {
          displayName: "User 2",
        },
        user3: {
          displayName: "User 3",
        },
      },
    });
  });
}

describe("Firestore security rules", () => {
  it("rejects a non-host trying to close a room", async () => {
    await createTestRoom();

    const user2 = testEnv.authenticatedContext("user2");
    const db = user2.firestore();

    await assertFails(
      updateDoc(doc(db, "rooms/ABC123"), {
        hostUid: "host1",
        status: "closed",
        matchMode: "strict",
      })
    );
  });

  it("rejects changing matchMode after voting has started", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      await setDoc(doc(db, "rooms/ABC123"), {
        hostUid: "host1",
        status: "voting",
        matchMode: "strict",
        members: {
          host1: {
            displayName: "Host",
          },
          user2: {
            displayName: "User 2",
          },
        },
      });
    });

    const user2 = testEnv.authenticatedContext("user2");
    const db = user2.firestore();

    await assertFails(
      updateDoc(doc(db, "rooms/ABC123"), {
        hostUid: "host1",
        status: "voting",
        matchMode: "majority",
        members: {
          host1: {
            displayName: "Host",
          },
          user2: {
            displayName: "User 2",
          },
        },
      })
    );
  });

  it("allows the current host to close the room", async () => {
    await createTestRoom();

    const host = testEnv.authenticatedContext("host1");
    const db = host.firestore();

    await assertSucceeds(
      updateDoc(doc(db, "rooms/ABC123"), {
        hostUid: "host1",
        status: "closed",
        matchMode: "strict",
        members: {
          host1: {
            displayName: "Host",
          },
          user2: {
            displayName: "User 2",
          },
          user3: {
            displayName: "User 3",
          },
        },
      })
    );
  });

  it("allows a member to claim an abandoned host role", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      await setDoc(doc(db, "rooms/ABC123"), {
        hostUid: "host1",
        status: "lobby",
        matchMode: "strict",
        members: {
          host1: {
            displayName: "Old Host",
          },
          user2: {
            displayName: "User 2",
          },
        },
      });

      await setDoc(
        doc(db, "rooms/ABC123/members/user2"),
        {
          displayName: "User 2",
        }
      );
    });

    const user2 = testEnv.authenticatedContext("user2");
    const db = user2.firestore();

    // Remove the old host's member document to simulate
    // the old host having left the room.
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();

      const { deleteDoc } = await import("firebase/firestore");

      await deleteDoc(
        doc(adminDb, "rooms/ABC123/members/host1")
      );
    });

    await assertSucceeds(
      updateDoc(doc(db, "rooms/ABC123"), {
        hostUid: "user2",
        status: "lobby",
        matchMode: "strict",
        members: {
          host1: {
            displayName: "Old Host",
          },
          user2: {
            displayName: "User 2",
          },
        },
      })
    );
  });

  it("only allows one claimant to win the host-claim race", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      await setDoc(doc(db, "rooms/ABC123"), {
        hostUid: "host1",
        status: "lobby",
        matchMode: "strict",
        members: {
          host1: {
            displayName: "Old Host",
          },
          user2: {
            displayName: "User 2",
          },
          user3: {
            displayName: "User 3",
          },
        },
      });

      await setDoc(
        doc(db, "rooms/ABC123/members/user2"),
        {
          displayName: "User 2",
        }
      );

      await setDoc(
        doc(db, "rooms/ABC123/members/user3"),
        {
          displayName: "User 3",
        }
      );
    });

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      const { deleteDoc } = await import("firebase/firestore");

      await deleteDoc(
        doc(db, "rooms/ABC123/members/host1")
      );
    });

    const user2 = testEnv.authenticatedContext("user2");
    const user3 = testEnv.authenticatedContext("user3");

    const db2 = user2.firestore();
    const db3 = user3.firestore();

    const claim2 = updateDoc(doc(db2, "rooms/ABC123"), {
      hostUid: "user2",
      status: "lobby",
      matchMode: "strict",
      members: {
        host1: {
          displayName: "Old Host",
        },
        user2: {
          displayName: "User 2",
        },
        user3: {
          displayName: "User 3",
        },
      },
    });

    const claim3 = updateDoc(doc(db3, "rooms/ABC123"), {
      hostUid: "user3",
      status: "lobby",
      matchMode: "strict",
      members: {
        host1: {
          displayName: "Old Host",
        },
        user2: {
          displayName: "User 2",
        },
        user3: {
          displayName: "User 3",
        },
      },
    });

    const results = await Promise.allSettled([
      claim2,
      claim3,
    ]);

    const successes = results.filter(
      (result) => result.status === "fulfilled"
    );

    expect(successes).toHaveLength(1);
  });

  it("allows the room host to delete a movie from the pool", async () => {
    await createTestRoom();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, "rooms/ABC123/movies/101"), {
        title: "Test Movie",
        tmdbId: 101,
      });
    });

    const host = testEnv.authenticatedContext("host1");
    const db = host.firestore();

    await assertSucceeds(deleteDoc(doc(db, "rooms/ABC123/movies/101")));
  });

  it("rejects a non-host trying to delete a movie from the pool", async () => {
    await createTestRoom();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, "rooms/ABC123/movies/101"), {
        title: "Test Movie",
        tmdbId: 101,
      });
    });

    const user2 = testEnv.authenticatedContext("user2");
    const db = user2.firestore();

    await assertFails(deleteDoc(doc(db, "rooms/ABC123/movies/101")));
  });

  it("allows a room member to send and read chat messages", async () => {
    await createTestRoom();

    const user2 = testEnv.authenticatedContext("user2");
    const db = user2.firestore();

    const { addDoc, collection, getDocs } = await import("firebase/firestore");

    await assertSucceeds(
      addDoc(collection(db, "rooms/ABC123/messages"), {
        uid: "user2",
        displayName: "User 2",
        text: "Hello world",
        createdAt: new Date(),
      })
    );

    await assertSucceeds(getDocs(collection(db, "rooms/ABC123/messages")));
  });

  it("rejects a non-member trying to send chat messages", async () => {
    await createTestRoom();

    const stranger = testEnv.authenticatedContext("stranger99");
    const db = stranger.firestore();

    const { addDoc, collection, getDocs } = await import("firebase/firestore");

    await assertFails(
      addDoc(collection(db, "rooms/ABC123/messages"), {
        uid: "stranger99",
        displayName: "Stranger",
        text: "Hello world",
        createdAt: new Date(),
      })
    );

    await assertFails(getDocs(collection(db, "rooms/ABC123/messages")));
  });

  it("rejects sending a message with empty text or spoofed uid", async () => {
    await createTestRoom();

    const user2 = testEnv.authenticatedContext("user2");
    const db = user2.firestore();

    const { addDoc, collection } = await import("firebase/firestore");

    // Spoofed uid
    await assertFails(
      addDoc(collection(db, "rooms/ABC123/messages"), {
        uid: "host1",
        displayName: "User 2",
        text: "Hello world",
        createdAt: new Date(),
      })
    );

    // Empty text
    await assertFails(
      addDoc(collection(db, "rooms/ABC123/messages"), {
        uid: "user2",
        displayName: "User 2",
        text: "",
        createdAt: new Date(),
      })
    );
  });
});