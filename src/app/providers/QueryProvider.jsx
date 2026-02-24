import { QueryClientProvider } from "@tanstack/react-query";

export const QueryProvider = ({ children, client }) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
