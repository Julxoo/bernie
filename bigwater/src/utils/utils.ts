import { redirect } from "next/navigation";
import { RedirectOptions } from "@/types/common";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @param {RedirectOptions} options - Additional options for redirection.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
  options?: RedirectOptions
) {
  let redirectUrl = `${path}?${type}=message&message=${encodeURIComponent(message)}`;
  
  if (options?.tab) {
    redirectUrl += `&tab=${options.tab}`;
  }
  
  return redirect(redirectUrl);
}
