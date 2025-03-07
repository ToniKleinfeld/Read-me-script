const fs = require("fs");
const { consoles } = require("inspector");
const path = require("path");
const readline = require("readline");

const templatePath = path.join(__dirname, "template.md");
const parentFolderPath = path.join(__dirname, "..");
const parentFolderName = path.basename(parentFolderPath);

const formattedName = parentFolderName
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join("%20");

let template;
try {
  template = fs.readFileSync(templatePath, "utf8");
} catch (err) {
  consoles.error("Template-Datei nicht gefunden:", err);
  process.exit(1);
}

function fillTemplate(template, data) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
    return data[key] || "";
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let author = "Toni Kleinfeld";
let github = "ToniKleinfeld";
let linkIn = "https://www.linkedin.com/in/tonikleinfeld/";
let website = "https://toni-kleinfeld.de/";
let projectLinkname = parentFolderName;
let projectName = '';
let description = '';
let installation = '';
let build = "";
let usage = "";
let createtWith = "Coded_in-JavaScript-yellow?logo=javascript";

rl.question(
  "Projectname (When empty use Project folder name): ",
  (projectNameInput) => {
    projectName = projectNameInput.trim() || `${formattedName}`;
    rl.question("Description: ", (descriptionInput) => {
      description =
        descriptionInput.trim() || "Description will follow at a later update.";
      rl.question("Author name: ", (authorinput) => {
        if (authorinput) {
          author = authorinput.trim();
        }
        rl.question("Github Profile: ", (githubinput) => {
          if (githubinput) {
            github = githubinput.trim();
          }
          rl.question("LinkIn URL: ", (linkIninput) => {
            if (linkIninput) {
              linkIn = linkIninput.trim();
            }
            rl.question("Website URL: ", (websiteinput) => {
              if (websiteinput) {
                website = websiteinput.trim();
              }
              rl.question(
                "How Install(empty -> JS, framework or your own instructions): ",
                (installationInput) => {
                  installation =
                    installationInput.trim() || "```sh\nnpm install\n ```";

                  if (
                    ["angular", "nuxt", "vue"].includes(
                      installation.toLowerCase()
                    )
                  ) {
                    build = returnFrameworkString(installation, "build");
                    usage = returnFrameworkString(installation, "usage");
                    createtWith = returnFrameworkString(installation, "banner");

                    console.log(
                      `Skipping build & usage questions. Using ${installation.toUpperCase()} as default.`
                    );
                    installation = "```sh\nnpm install\n ```";
                    finalize();
                  } else {
                    rl.question(
                      "How to build (empty , angular, nuxt, vue ): ",
                      (buildinput) => {
                        build = buildinput.trim() || "";
                        rl.question("How to use: ", (usageinput) => {
                          usage = usageinput.trim() || "";
                          finalize();
                        });                        
                      }
                    );
                  }
                  
                }
              );
            });
          });
        });
      });
    });
  }
);

function finalize() {
                    
  let data = {
    projectName,
    projectLinkname,
    description,
    installation,
    createtWith,
    build,
    usage,
    author,
    github,
    linkIn,
    website,
  };

  let filledContent = fillTemplate(template, data);

  filledContent = checkEmptyTemplate(
    usage,
    "usage",
    filledContent
  );
  filledContent = checkEmptyTemplate(
    build,
    "build",
    filledContent
  );

  const outputPath = path.join(__dirname, "..", "README.md");

  fs.writeFileSync(outputPath, filledContent.trim());
  console.log(
    `README.md was successfully saved in the folder ${path.join(
      __dirname,
      ".."
    )} created!`
  );
  rl.close();
}

function checkEmptyTemplate(Value, part, filledContent) {
  filledContent;

  if (!Value) {
    filledContent = filledContent.replace(returnPart(Value, part), "");
  } else {
    filledContent = filledContent
      .replace(returnPart(Value, `${part}-start`), "")
      .replace(returnPart(Value, `${part}-end`), "");
  }

  return filledContent;
}

function returnFrameworkString(Value, part) {
  if (part == "build") {
    if (Value.toLowerCase() === "angular") {
      return "Run\n ```sh\nng build\n``` \n to build the project. The build artifacts will be stored in the dist/ directory.";
    } else if (Value.toLowerCase() === "nuxt") {
      return "Build the application for production with\n  ```sh\nnpm run build\n```";
    } else if (Value.toLowerCase() === "vue") {
      return "Type-Check, Compile and Minify for Production\n  ```sh\nnpm run build\n ```";
    }
  } else if (part == "usage") {
    if (Value.toLowerCase() === "angular") {
      return "Run\n  ```sh\nng serve\n```\n  for a dev server. Navigate to http://localhost:4200/. The application will automatically reload if you change any of the source files.";
    } else if (Value.toLowerCase() === "nuxt") {
      return "Start the development server on http://localhost:3000 with\n  ```sh\nnpm run dev\n```";
    } else if (Value.toLowerCase() === "vue") {
      return "Compile and Hot-Reload for Development\n  ```sh\nnpm run dev\n```";
    }
  } else if (part == "banner") {
    if (Value.toLowerCase() === "angular") {
      return "Framework-Angular-darkred?logo=angular";
    } else if (Value.toLowerCase() === "nuxt") {
      return "Framework-NUXT3-neongreen?logo=nuxt";
    } else if (Value.toLowerCase() === "vue") {
      return "Framework-VUE-darkgreen?logo=vuedotjs";
    }
  }
}

function returnPart(value, part) {
  if (part == "usage" && !value) {
    return /<!-- USAGE_START -->[\s\S]*?<!-- USAGE_END -->/;
  } else if (part == "build" && !value) {
    return /<!-- BUILD_START -->[\s\S]*?<!-- BUILD_END -->/;
  } else if (part == "usage-start") {
    return /<!-- USAGE_START -->/g;
  } else if (part == "usage-end") {
    return /<!-- USAGE_END -->/g;
  } else if (part == "build-start") {
    return /<!-- BUILD_START -->/g;
  } else if (part == "build-end") {
    return /<!-- BUILD_END -->/g;
  }
}
