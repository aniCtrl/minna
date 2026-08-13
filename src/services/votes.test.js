import { describe, expect, it } from "vitest";
import { computeMatches } from "./votes";

describe("computeMatches", () => {
  it("returns a movie when every member likes it", () => {
    const movies = [
      {
        id: 1,
        title: "Inception",
      },
      {
        id: 2,
        title: "Interstellar",
      },
    ];

    const members = [
      {
        uid: "user1",
      },
      {
        uid: "user2",
      },
    ];

    const votes = {
      "user1_1": {
        uid: "user1",
        movieId: "1",
        vote: "like",
      },
      "user2_1": {
        uid: "user2",
        movieId: "1",
        vote: "like",
      },
      "user1_2": {
        uid: "user1",
        movieId: "2",
        vote: "like",
      },
      "user2_2": {
        uid: "user2",
        movieId: "2",
        vote: "dislike",
      },
    };

    const matches = computeMatches(
      movies,
      votes,
      members
    );

    expect(matches).toEqual([
      {
        id: 1,
        title: "Inception",
      },
    ]);
  });


  it("returns no matches when nobody unanimously likes a movie", () => {
    const movies = [
      {
        id: 1,
        title: "Inception",
      },
      {
        id: 2,
        title: "Interstellar",
      },
    ];

    const members = [
      {
        uid: "user1",
      },
      {
        uid: "user2",
      },
    ];

    const votes = {
      "user1_1": {
        uid: "user1",
        movieId: "1",
        vote: "like",
      },
      "user2_1": {
        uid: "user2",
        movieId: "1",
        vote: "dislike",
      },
      "user1_2": {
        uid: "user1",
        movieId: "2",
        vote: "dislike",
      },
      "user2_2": {
        uid: "user2",
        movieId: "2",
        vote: "dislike",
      },
    };

    const matches = computeMatches(
      movies,
      votes,
      members
    );

    expect(matches).toEqual([]);
  });


  it("excludes movies that only some members like", () => {
    const movies = [
      {
        id: 1,
        title: "Inception",
      },
    ];

    const members = [
      {
        uid: "user1",
      },
      {
        uid: "user2",
      },
      {
        uid: "user3",
      },
    ];

    const votes = {
      "user1_1": {
        uid: "user1",
        movieId: "1",
        vote: "like",
      },
      "user2_1": {
        uid: "user2",
        movieId: "1",
        vote: "like",
      },
      "user3_1": {
        uid: "user3",
        movieId: "1",
        vote: "dislike",
      },
    };

    const matches = computeMatches(
      movies,
      votes,
      members
    );

    expect(matches).toEqual([]);
  });
});