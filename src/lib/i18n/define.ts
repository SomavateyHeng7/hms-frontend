/** Declares Khmer text with its exact keys kept, so `useT` can type-check every key. */
export const defineKhmer = <T extends Record<string, string>>(messages: T) => messages;
