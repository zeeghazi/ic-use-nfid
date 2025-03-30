import { type ReactNode } from "react";
import { type AuthClientCreateOptions } from "@dfinity/auth-client";
import type { LoginOptions } from "./login-options.type";
import type { NFIDContextType } from "./context.type";
/**
 * Hook to access the internet identity as well as login status along with
 * login and clear functions.
 */
export declare const useNFID: () => NFIDContextType;
/**
 * The NFIDProvider component makes the saved identity available
 * after page reloads. It also allows you to configure default options
 * for AuthClient and login.
 */
export declare function NFIDProvider({ children, createOptions, loginOptions, }: {
    /** The child components that the NFIDProvider will wrap. This allows any child
     * component to access the authentication context provided by the NFIDProvider. */
    children: ReactNode;
    /** Options for creating the {@link AuthClient}. See AuthClient documentation for list of options
     *
     *`ic-use-nfid` defaults to disabling the AuthClient idle handling (clearing identities
     * from store and reloading the window on identity expiry). If that behaviour is preferred, set these settings:
     *
     * ```
     * const options = {
     *   idleOptions: {
     *     disableDefaultIdleCallback: false,
     *     disableIdle: false,
     *   },
     * }
     * ```
     */
    createOptions?: AuthClientCreateOptions;
    /** Options that determine the behaviour of the {@link AuthClient} login call. These options are a subset of
     * the {@link AuthClientLoginOptions}.
     */
    loginOptions?: LoginOptions;
}): ReactNode;
