import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter.")
  .max(72, "Kata sandi maksimal 72 karakter.")
  .refine((value) => new TextEncoder().encode(value).byteLength <= 72, "Kata sandi terlalu panjang.");

export const loginSchema = z.object({
  email: z.string().email("Masukkan alamat email yang valid."),
  password: passwordSchema,
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(60),
  passwordConfirm: passwordSchema,
  acceptedTerms: z.literal(true, "Kamu perlu menyetujui ketentuan untuk membuat akun."),
}).refine((values) => values.password === values.passwordConfirm, {
  message: "Konfirmasi kata sandi belum sama.",
  path: ["passwordConfirm"],
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Masukkan alamat email yang valid.").transform((value) => value.trim().toLowerCase()),
});

export const passwordResetSchema = z.object({
  token: z.string().min(32).max(256),
  password: passwordSchema,
  passwordConfirm: passwordSchema,
}).refine((values) => values.password === values.passwordConfirm, {
  message: "Konfirmasi kata sandi belum sama.",
  path: ["passwordConfirm"],
});

export const settingsSchema = z.object({
  name: z.string().trim().min(2).max(60),
  timezone: z.string().min(1).max(100).refine((value) => {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Pilih zona waktu yang valid."),
});

export const quizSubmissionSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    selectedOption: z.string().min(1).max(300),
  })).min(1).max(10),
});

export const generatedVocabularySchema = z.object({
  words: z
    .array(
      z.object({
        word: z.string().trim().min(1).max(60),
        meaning: z.string().trim().min(1).max(200),
        pronunciation: z.string().trim().min(1).max(100),
        partOfSpeech: z.string().trim().min(1).max(40),
        example: z.string().trim().min(1).max(300),
        exampleTranslation: z.string().trim().min(1).max(300),
      }),
    )
    .length(10),
});

export const generatedGrammarSchema = z.object({
  questions: z.array(z.object({
    topic: z.string().trim().min(2).max(100),
    rule: z.string().trim().min(10).max(400),
    example: z.string().trim().min(3).max(300),
    translation: z.string().trim().min(3).max(300),
    prompt: z.string().trim().min(5).max(300),
    options: z.array(z.string().trim().min(1).max(150)).length(3),
    answer: z.string().trim().min(1).max(150),
    explanation: z.string().trim().min(5).max(300),
  })).length(5),
});

export const grammarAttemptSchema = z.object({
  dailySetId: z.string().uuid(),
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    selectedOption: z.string().trim().min(1).max(150),
  })).length(5),
});

export const placementSubmissionSchema = z.object({
  answers: z.array(z.object({
    questionIndex: z.number().int().min(0).max(14),
    selectedOption: z.number().int().min(0).max(3),
  })).length(15),
});

export const reviewSchema = z.object({
  remembered: z.boolean(),
});

export const conversationSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  sessionId: z.string().uuid(),
});
