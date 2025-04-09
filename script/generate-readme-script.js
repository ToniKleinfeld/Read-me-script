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

// parser for .env Datei
function loadEnv(filePath = ".env") {
  const fullPath = path.resolve(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(
      `⚠️  no .env Datei found at: ${filePath} \n-- skip loading, continue without`
    );
    return;
  }

  const envData = fs.readFileSync(path.resolve(__dirname, filePath), "utf-8");
  const lines = envData.split("\n");
  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) return;
    const [key, ...valueParts] = trimmedLine.split("=");
    const value = valueParts
      .join("=")
      .trim()
      .replace(/^"(.*)"$/, "$1");
    process.env[key.trim()] = value;
  });
}

loadEnv();

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

let author = process.env.author || "";
let github = process.env.github || "";
let linkIn = process.env.linkIn || "";
let website = process.env.website || "";
let projectLinkname = parentFolderName;
let projectName = "";
let description = "";
let installation = "";
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
      rl.question(
        "Author name(when empty using default from .env): ",
        (authorinput) => {
          if (authorinput) {
            author = authorinput.trim();
          }
          rl.question(
            "Github Profile(when empty using default from .env): ",
            (githubinput) => {
              if (githubinput) {
                github = githubinput.trim();
              }
              rl.question(
                "LinkIn URL(when empty using default from .env): ",
                (linkIninput) => {
                  if (linkIninput) {
                    linkIn = linkIninput.trim();
                  }
                  rl.question(
                    "Website URL(when empty using default from .env): ",
                    (websiteinput) => {
                      if (websiteinput) {
                        website = websiteinput.trim();
                      }
                      rl.question(
                        "How Install(empty = JavaScript,or enter frameworkname for 'pre default' instructions. Or add your own instructions here!): ",
                        (installationInput) => {
                          installation = installationInput.trim() || "";

                          if (
                            [
                              "angular",
                              "nuxt",
                              "vue",
                              "react",
                              "django",
                            ].includes(installation.toLowerCase())
                          ) {
                            build = returnFrameworkString(
                              installation,
                              "build"
                            );
                            usage = returnFrameworkString(
                              installation,
                              "usage"
                            );
                            createtWith = returnFrameworkString(
                              installation,
                              "banner"
                            );

                            console.log(
                              `Skipping build & usage questions. Using ${installation.toUpperCase()} as default.`
                            );
                            if (installation == "django") {
                              installation =
                                "First install all needed packages.\n ```sh\npip install -r requirements.txt \n```";
                            } else {
                              installation = "```sh\nnpm install\n ```";
                            }
                            finalize();
                          } else {
                            rl.question("How to build: ", (buildinput) => {
                              build = buildinput.trim() || "";
                              rl.question("How to use: ", (usageinput) => {
                                usage = usageinput.trim() || "";
                                finalize();
                              });
                            });
                          }
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
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

  let license = "default";
  let moreinfo = "default";

  if ([github, author].every((v) => v === "")) {
    license = "";
  }

  if ([linkIn, website, github, author].every((v) => v === "")) {
    moreinfo = "";
  }

  let filledContent = fillTemplate(template, data);

  filledContent = checkEmptyTemplate(installation, "install", filledContent);
  filledContent = checkEmptyTemplate(usage, "usage", filledContent);
  filledContent = checkEmptyTemplate(build, "build", filledContent);
  filledContent = checkEmptyTemplate(author, "author", filledContent);
  filledContent = checkEmptyTemplate(website, "website", filledContent);
  filledContent = checkEmptyTemplate(github, "github", filledContent);
  filledContent = checkEmptyTemplate(linkIn, "linkIn", filledContent);
  filledContent = checkEmptyTemplate(moreinfo, "moreinfo", filledContent);
  filledContent = checkEmptyTemplate(license, "license", filledContent);

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
      return "Run\n```sh\nng build\n```\n to build the project. The build artifacts will be stored in the dist/ directory.";
    } else if (Value.toLowerCase() === "nuxt") {
      return "Build the application for production with\n```sh\nnpm run build\n```";
    } else if (Value.toLowerCase() === "vue") {
      return "Type-Check, Compile and Minify for Production\n ```sh\nnpm run build\n ```";
    } else if (Value.toLowerCase() === "django") {
      return "";
    } else if (Value.toLowerCase() === "react") {
      return "\nBuild the application for production with\n```sh\nnpm run build\n```";
    }
  } else if (part == "usage") {
    if (Value.toLowerCase() === "angular") {
      return "Run\n  ```sh\nng serve\n```\n  for a dev server. Navigate to http://localhost:4200/. The application will automatically reload if you change any of the source files.";
    } else if (Value.toLowerCase() === "nuxt") {
      return "Start the development server on http://localhost:3000 with\n  ```sh\nnpm run dev\n```";
    } else if (Value.toLowerCase() === "vue") {
      return "Compile and Hot-Reload for Development\n  ```sh\nnpm run dev\n```";
    } else if (Value.toLowerCase() === "django") {
      return "How to start local server:\n ```sh\npython manage.py runserver \n```";
    } else if (Value.toLowerCase() === "react") {
      return "Start the development server on http://localhost:3000: \n```sh\nnpm start\n```";
    }
  } else if (part == "banner") {
    if (Value.toLowerCase() === "angular") {
      return "Framework-Angular-darkred?logo=angular";
    } else if (Value.toLowerCase() === "nuxt") {
      return "Framework-NUXT3-neongreen?logo=nuxt";
    } else if (Value.toLowerCase() === "vue") {
      return "Framework-Vue-darkgreen?logo=vuedotjs";
    } else if (Value.toLowerCase() === "django") {
      return "Framework-Django-lightgreen?logo=django";
    } else if (Value.toLowerCase() === "react") {
      return "Framework-React-lightblue?logo=react";
    }
  }
}

function returnPart(value, part) {
  const basePart = part.replace(/-start|-end/, "");
  const isStart = part.endsWith("-start");
  const isEnd = part.endsWith("-end");

  const validParts = [
    "install",
    "usage",
    "build",
    "author",
    "website",
    "github",
    "linkIn",
    "moreinfo",
    "license",
  ];

  if (!validParts.includes(basePart)) return null;

  if (!value && !isStart && !isEnd) {
    return new RegExp(
      `<!-- ${basePart.toUpperCase()}_START -->[\\s\\S]*?<!-- ${basePart.toUpperCase()}_END -->`
    );
  }
  if (isStart) {
    return new RegExp(`<!-- ${basePart.toUpperCase()}_START -->`, "g");
  }
  if (isEnd) {
    return new RegExp(`<!-- ${basePart.toUpperCase()}_END -->`, "g");
  }
  return null;
}
