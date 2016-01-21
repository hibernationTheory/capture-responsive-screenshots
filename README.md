# Capture Responsive Screenshots

Captures screenshots at different breakpoints from given URLs as defined in a config file. Uses CasperJS and PhantomJS.

## How to Use

- Run `npm install` to get the dependencies
- `data.json` file lists the url's that will be visited by the tool.
- `config.json` has configuration options such as the viewport sizes for the screenshots.
	- Leaving `config.json` empty will use default values, but links in data.json have to be provided.
- Run `npm run main` to execute the script. The images will be saved into `./images/` folder (destination folder is configurable).

## To Do

- Document other `config.json` options.