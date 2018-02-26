# ARTemis
## Drawathon
- Members:
    - Shadman Shadid
    - Vijanthan Thiruchelvarajah
    - Vishakan Shanthakumar
## Description
- A drawing game where the server shows a simple cartoon image of an object to two or more teams. The teams must then compete to draw their own version of the provided image within a time limit. After the timer has ended the server uses a image comparison api to score each team based on their closeness to the original image and decides who the winner is of that round is. There will be multiple rounds and the score will accumulate.
## Key Features
- Beta Vesion
    - A multi-user real time canvas for each team to draw on. Each canvas will contain:
        - Several draw tools: Pen, Pencil, Brush.
        - Size Selector: Changes the size of the draw tool.
        - Multiple colors: Only the basic ones.
    - In-game chat for communication amongst players. There will be:
        - A team specific chat that can be used in game.
        - A cross team chat inbetween games.
        - Global chat for users not in a game.
    - A game host who has full administrative controls over a game. They can:
        - Create a game instance which can be private or public. Private games will have a password or only allow invited users.
        - Upload images of their choice and edit it themselves.
        - Host multiple games simultaneously.
        - View each team's canvas and chat, real time.
        - Set, extend, and manipulate the timer.
        - Send announcements to the teams while they play.
        - Veto the API's decision on who the winner is.
        - Manipulate the score of each team in a open and transparent manner.
    - Animated UI that feels smooth and clean.
- Final Version
    - Additional canvas features:
        - Autofill feature.
        - More draw tools.
        - Color mixer.
    - The in game chat will have voice capabilities.
    - A sabotage system in between rounds where teams can handicap other teams. Potential handicaps include:
        - Limited to using only one color.
        - Less members available to draw.
        - Source image is blurred.
        - Reduced time to draw.
    - The host will be able to fully moniter and manipulate any sabotoges.
## Technical
- For this project we will be using:
    - nodejs for server-side coding.
    - mongoDB for datastorage.
    - Angularjs and Snap.svg for clientside web page and canvas design.
    - Web sockets to synchronize the canvases.
    - WebRTC, specifically PeerJs, for in game chat and voice service.
    - clarifai for image comparision.
- Difficulties:
    - Integrating several APIs into the project.
    - Designing a canvas with various features and functions such as the draw tools and autofill.
    - Synchronizing each user to a team canvas, and each team canvas to a game instance/host in concert using websockets.
    - Creating a separate chat system with voice service and intergrating it to the different layers/levels of the application.
    - Allowing a user to host multiple games and have all of those authorative permissions.



