/// <reference types="vite/client" />
/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
  readonly VITE_DEV_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// TypeScript module declarations for better VS Code support
declare module "convex/react" {
  import type { ComponentType, ReactNode } from "react";
  
  export function useQuery<T>(query: any): T | undefined;
  export function useMutation<T>(mutation: any): T;
  export function useAction<T>(action: any): T;
  export function useConvex(): any;
  
  export const ConvexProvider: ComponentType<{ client: any; children: ReactNode }>;
  export const ConvexReactClient: new (url: string) => any;
  export const Authenticated: ComponentType<{ children: ReactNode }>;
  export const Unauthenticated: ComponentType<{ children: ReactNode }>;
  export const AuthLoading: ComponentType<{ children: ReactNode }>;
}

declare module "@convex-dev/auth/react" {
  import type { ComponentType, ReactNode } from "react";
  export const ConvexAuthProvider: ComponentType<{ client: any; children: ReactNode }>;
}

declare module "sonner" {
  import { ComponentType } from "react";
  export const Toaster: ComponentType<any>;
}

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

/// <reference types="vite/client" />
/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

// TypeScript module declarations for better VS Code support
declare module "convex/react" {
  import type { ComponentType, ReactNode } from "react";
  
  export function useQuery<T>(query: any): T | undefined;
  export function useMutation<T>(mutation: any): T;
  export function useAction<T>(action: any): T;
  export function useConvex(): any;
  
  export const ConvexProvider: ComponentType<{ client: any; children: ReactNode }>;
  export const ConvexReactClient: new (url: string) => any;
  export const Authenticated: ComponentType<{ children: ReactNode }>;
  export const Unauthenticated: ComponentType<{ children: ReactNode }>;
  export const AuthLoading: ComponentType<{ children: ReactNode }>;
}

declare module "sonner" {
  import { ComponentType } from "react";
  export const Toaster: ComponentType<any>;
}

