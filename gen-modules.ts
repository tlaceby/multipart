const SEPERATOR = `// ------ AUTO GENERATED MODULE DECLARATIONS ---------- //\n// -------------------------------------------------------`;
const SUPPORTED_MINIMUM = 0.1;
const SUPPORTED_MAXIMUM = 2.4;
const encoder = new TextEncoder();
const GENERATED_TEMPLATE = (version: string) => {
	return `
	declare module "https://deno.land/x/opine@${version}.0/mod.ts" {
		interface OpineRequest {
			multipartData?: MultipartFormData;
			multipartFiles?: FormFile[];
		}
	}`;
};

const FILE_BEFORE_SEPERATOR = (await Deno.readTextFile("./opine/mod.ts")).split(
	SEPERATOR
)[0];

const file = await Deno.open("./test.ts", { write: true });
await file.write(encoder.encode(FILE_BEFORE_SEPERATOR));

await file.write(encoder.encode(SEPERATOR));

for (
	let version = SUPPORTED_MINIMUM;
	version < SUPPORTED_MAXIMUM;
	version += 0.1
) {
	const v = version.toFixed(1);
	file.writeSync(encoder.encode(GENERATED_TEMPLATE(v)));
}
