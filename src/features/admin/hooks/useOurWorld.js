import { useQuery } from "@tanstack/react-query";
import { fetchOurWorldLogos } from "../api/ourWorldApi";

export default function useOurWorld() {
  return useQuery({
    queryKey: ["ourWorld"],
    queryFn: fetchOurWorldLogos,
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
}
