export const placementQuestions = [
  {
    prompt: "My name ___ Rina.",
    options: ["am", "is", "are", "be"],
    answerIndex: 1,
  },
  {
    prompt: "They ___ to school by bus every day.",
    options: ["go", "goes", "going", "gone"],
    answerIndex: 0,
  },
  {
    prompt: "I saw ___ elephant at the zoo.",
    options: ["a", "an", "the", "no article"],
    answerIndex: 1,
  },
  {
    prompt: "There ___ two books on the table.",
    options: ["is", "was", "are", "be"],
    answerIndex: 2,
  },
  {
    prompt: "We ___ a movie last night.",
    options: ["watch", "watched", "have watch", "are watching"],
    answerIndex: 1,
  },
  {
    prompt: "She has lived in Jakarta ___ 2020.",
    options: ["for", "since", "during", "from"],
    answerIndex: 1,
  },
  {
    prompt: "If it rains tomorrow, we ___ at home.",
    options: ["stayed", "would stay", "will stay", "had stayed"],
    answerIndex: 2,
  },
  {
    prompt: "The book ___ you gave me is fascinating.",
    options: ["who", "where", "whose", "that"],
    answerIndex: 3,
  },
  {
    prompt: "By the time we arrived, the meeting ___.",
    options: ["starts", "has started", "had started", "was starting"],
    answerIndex: 2,
  },
  {
    prompt: "You ___ wear a seat belt; it is required by law.",
    options: ["might", "must", "would", "could"],
    answerIndex: 1,
  },
  {
    prompt: "The new library ___ next year.",
    options: ["will open", "will be opened", "has opened", "is opening by"],
    answerIndex: 1,
  },
  {
    prompt: "If I ___ more time, I would learn another language.",
    options: ["have", "will have", "had", "would have"],
    answerIndex: 2,
  },
  {
    prompt: "Rarely ___ such a compelling argument.",
    options: ["I have heard", "have I heard", "I heard have", "heard I have"],
    answerIndex: 1,
  },
  {
    prompt: "The proposal, ___ by the committee, will be announced tomorrow.",
    options: ["approving", "approved", "was approved", "has approve"],
    answerIndex: 1,
  },
  {
    prompt: "No sooner ___ the announcement than the audience began to applaud.",
    options: ["the speaker made", "had the speaker made", "the speaker had made", "did the speaker make"],
    answerIndex: 1,
  },
] as const;

export function getPlacementLevel(score: number) {
  if (score <= 5) return "BEGINNER";
  if (score <= 10) return "INTERMEDIATE";
  return "ADVANCED";
}
