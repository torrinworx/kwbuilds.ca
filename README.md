# KWBuilds.ca
Browse local projects, see what you're friends and neighbours are building!

Everything from startup ideas, to fun weekend projects. Ask for help or offer a helping hand! I want to build a community where local founders and builders can find collaboraters and cofounders.

KW and Canadian culture in general could benifit from more public forms and spaces to meet people. I want this site to be meeting place for techies and entraprenures to meet and collaborate and get a feel for what is being built around them in their communities.

How it works:
- You sign up
- You post something like "Hey, I'm building this open source project/startup idea/hobby."
- people can browse and reach out. We encourage people to meetup irl over coffee to discuss their ideas and projects
- The goal isn't jobs. This isn't a job board, nor is it a pitch board. This is a place where people can keep a pulse on the ideas flowing around our community. 

## Frontend workflow
Run `npm run dev` to start the backend server and the integrated Vite dev server together; the app is available at `http://localhost:3002` and Tauri dev sessions will now attach to that address.
With an Android device connected, use `npm run dev:android` to reverse-forward port `3002` via `adb reverse tcp:3002 tcp:3002` and then launch `npx tauri android dev`, so the device points at the same backend+Vite server as desktop dev.
For production builds, run `npm run build:web` and then `npx tauri build`; the Tauri bundle picks up whatever Vite writes under `./build/dist`.
Once your Android toolchain is configured, you can run `npx tauri build --target android` to produce an APK that bundles the same `./build/dist` frontend.
