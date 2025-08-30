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
