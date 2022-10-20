const SUPPORTED_MINIMUM = 2.0;
const SUPPORTED_MAXIMUM = 2.4;

// Erases file and begin by appending the Library Guts
const template_file_contents = Deno.readTextFileSync("./opine/template.ts");
const search_pattern = "opine@2.2.0";

for (
  let version = SUPPORTED_MINIMUM;
  version < SUPPORTED_MAXIMUM;
  version += 0.1
) {
  const v = version.toFixed(1) + ".0";
  const filename = `multipart_opine${v}.ts`;
  try {
    Deno.removeSync(`./opine/${filename}`);
  } catch (_) {
    //
  }
  await Deno.writeTextFile(
    `./opine/${filename}`,
    template_file_contents.replaceAll(search_pattern, `opine@${v}`),
  );
}
