export const generateLoginLink = (email: string, password: string): string => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    email: btoa(email), // Base64 encode for basic obfuscation
    password: btoa(password),
    auto: 'true'
  });
  return `${baseUrl}/login?${params.toString()}`;
};

export const copyLoginLinkToClipboard = async (email: string, password: string): Promise<void> => {
  const link = generateLoginLink(email, password);
  await navigator.clipboard.writeText(link);
};
