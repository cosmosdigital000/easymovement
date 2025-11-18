// Global type declarations for the application

import { JQueryStatic } from 'jquery';

declare global {
  interface Window {
    jQuery: JQueryStatic;
    $: JQueryStatic;
  }
}
