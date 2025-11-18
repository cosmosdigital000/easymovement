// Type declarations for JavaScript modules

// Declaration for main.js module
declare module '../js/main' {
  // Main.js initializes jQuery plugins when imported
  const main: any;
  export = main;
}

// Declaration for any JS files in the js directory
declare module '../js/*' {
  const jsModule: any;
  export = jsModule;
}

// Wildcard declaration for JavaScript modules
declare module '*.js' {
  const content: any;
  export = content;
}
