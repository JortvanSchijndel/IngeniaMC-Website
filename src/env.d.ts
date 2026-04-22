/// <reference types="astro/client" />
/// <reference path="../worker-configuration.d.ts" />

declare namespace App {
    interface Locals {
        mcUsername: string | null;
        cfContext: ExecutionContext;
    }
}