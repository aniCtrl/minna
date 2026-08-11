import { useState } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

function FirebaseTest() {
  const [message, setMessage] = useState("");

  async function pingFirebase() {
    try {
      await addDoc(collection(db, "test"), {
        message: "Hello from Movie Night Matcher",
        createdAt: new Date().toISOString(),
      });

      const snapshot = await getDocs(collection(db, "test"));

      console.log("Firestore data:", snapshot.docs.map((doc) => doc.data()));

      setMessage("Firebase connection works!");
    } catch (error) {
      console.error("Firebase error:", error);
      setMessage("Firebase connection failed.");
    }
  }

  return (
    <div>
      <h1>Firebase Test</h1>

      <button onClick={pingFirebase}>
        Ping Firebase
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default FirebaseTest;

