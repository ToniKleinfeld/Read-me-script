const fs = require("fs");
const { console } = require("inspector");
const path = require("path");
const readline = require("readline");

const templatePath = path.join(__dirname, "template.md");
const parentFolderPath = path.join(__dirname, "..");
const parentFolderName = path.basename(parentFolderPath);

const formattedName = parentFolderName
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

let template;
try {
  template = fs.readFileSync(templatePath, "utf8");
} catch (err) {
  console.error("Template-Datei nicht gefunden:", err);
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

rl.question(
  "Projectname (When empty use Project folder name): ",
  (projectName) => {
    rl.question("Description: ", (description) => {
      rl.question(
        "How Install(empty -> JS, framework or your own instructions): ",
        (installation) => {
          let build = '';
          let usage = ''
          installation = installation.trim() || "```sh npm install```";
          createtWith = "Coded_in-JavaScript-yellow";

          if (["angular", "nuxt", "vue"].includes(installation.toLowerCase())) {
            build = returnFrameworkString(installation, "build");
            usage = returnFrameworkString(installation, "usage");
            createtWith = returnFrameworkString(installation, "banner");

            console.log(
              `Skipping build & usage questions. Using ${installation.toUpperCase()} as default.`
            );
            installation = "```sh npm install```";
            finalize();
          } else {
            rl.question(
              "How to build (empty , angular, nuxt, vue ): ",
              (buildinput) => {
                rl.question("How to use: ", (usageinput) => {
                  build = buildinput.trim() || '';
                  usage = usageinput.trim() || '';
                  finalize();
                });
              }
            );
          }

          function finalize() {
            projectName = projectName.trim() || `${formattedName}`;
            let porjectLinkname = parentFolderName;
            description =
              description.trim() ||
              "Description will follow at a later update.";

            // Datenobjekt für die Platzhalter im Template
            const data = {
              projectName,
              porjectLinkname,
              description,
              installation,
              createtWith,
              build,
              usage,
              author,
              github,
              linkIn,
            };

            let filledContent = fillTemplate(template, data);

            filledContent = checkEmptyTemplate(usage, "usage", filledContent);
            filledContent = checkEmptyTemplate(build, "build", filledContent);

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
        }
      );
    });
  }
);

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
      return "Run ```sh ng build ``` to build the project. The build artifacts will be stored in the dist/ directory.";
    } else if (Value.toLowerCase() === "nuxt") {
      return "Build the application for production with ```sh npm run build ```";
    } else if (Value.toLowerCase() === "vue") {
      return "Type-Check, Compile and Minify for Production ```sh npm run build ```";
    }
  } else if (part == "usage") {
    if (Value.toLowerCase() === "angular") {
      return "Run ```sh ng serve ``` for a dev server. Navigate to http://localhost:4200/. The application will automatically reload if you change any of the source files.";
    } else if (Value.toLowerCase() === "nuxt") {
      return "Start the development server on http://localhost:3000 with ```sh npm run dev ```";
    } else if (Value.toLowerCase() === "vue") {
      return "Compile and Hot-Reload for Development ```sh npm run dev ```";
    }
  } else if (part == "banner") {
    if (Value.toLowerCase() === "angular") {
      return "Framework-Angular-darkred";
    } else if (Value.toLowerCase() === "nuxt") {
      return "Framework-NUXT3-darkblue";
    } else if (Value.toLowerCase() === "vue") {
      return "Framework-VUE-darkgreen`";
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
