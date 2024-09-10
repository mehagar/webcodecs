/**********************************************************************
 * Companion script to create individual auto publication workflows for
 * specifications contained in the repository. Run the script any time
 * the auto-publish-template.yml is updated or when the list of specs
 * changes below.
 **********************************************************************/

/**
 * List of properties that can appear to describe a spec.
 */
const properties = [
  // Spec shortname (without level), e.g., 'webcodecs'
  // (Shortname does not *have* to be the actual published shortname, just
  // an identifier used to tell specs apart internally)
  // The shortname is derived from the source file name if not provided,
  // replacing "_" with "-"
  'shortname',

  // Spec status on /TR, e.g., 'WD'
  'publicationStatus',

  // Relative path to source file
  'source',

  // Relative path to destination file in gh-pages branch (Optional)
  // If not provided, the destination file is computed from the source by
  // removing `.src`.
  'destination',

  // Name of the repository secret that contains the publication token for
  // Echidna (Optional).
  // If not provided, the name is computed from the shortname, e.g.,
  // `ECHIDNA_TOKEN_WEBCODECS` for `webcodecs`
  'tokenName',

  // Additional paths that should trigger the auto-publish script if changed
  // on top of the actual source (Optional). Glob patterns may be used.
  'additionalPaths'
];


/**
 * List of specs for which an auto-publish script needs to be created.
 */
const specs = [
  {
    shortname: 'webcodecs',
    source: 'index.src.html',
    publicationStatus: 'WD'
  },
  {
    source: 'codec_registry.src.html',
    publicationStatus: 'DRY'
  },
  {
    source: 'avc_codec_registration.src.html',
    publicationStatus: 'NOTE-WD'
  },
  {
    source: 'vorbis_codec_registration.src.html',
    publicationStatus: 'NOTE-WD'
  },
  {
    source: 'mp3_codec_registration.src.html',
    publicationStatus: 'NOTE-WD'
  },
  {
    source: 'aac_codec_registration.src.html',
    publicationStatus: 'NOTE-WD'
  },
  {
    source: 'flac_codec_registration.src.html',
    publicationStatus: 'NOTE-WD'
  },
  {
    source: 'opus_codec_registration.src.html',
    publicationStatus: 'NOTE-WD'
  },
  {
    source: 'av1_codec_registration.src.html',
    publicationStatus: 'NOTE-WD'
  },
  {
    source: 'vp9_codec_registration.src.html',
    publicationStatus: 'NOTE-WD'
  },
  {
    source: 'vp8_codec_registration.src.html',
    publicationStatus: 'NOTE-WD'
  },
  {
    source: 'pcm_codec_registration.src.html',
    publicationStatus: 'NOTE-WD'
  },
  {
    source: 'alaw_codec_registration.src.html',
    publicationStatus: 'NOTE-WD'
  },
  {
    source: 'ulaw_codec_registration.src.html',
    publicationStatus: 'NOTE-WD'
  },
  {
    source: 'hevc_codec_registration.src.html',
    publicationStatus: 'NOTE-WD'
  },
  {
    source: 'video_frame_metadata_registry.src.html',
    publicationStatus: 'DRY',
    tokenName: 'ECHIDNA_TOKEN_VIDEOFRAMEMETADATA_REGISTRY'
  }
];


/**
 * Main loop, create a workflow per spec
 */
import assert from 'node:assert';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = dirname(fileURLToPath(import.meta.url));
let template = await readFile(join(scriptPath, 'auto-publish-template.yml'), 'utf8');
template = template.replace(/#{5,}.*#{5,}/s,
`######################################################################
# IMPORTANT: Do not edit this file directly!
#
# This workflow was automatically generated through the
# generate-auto-publish-workflows.mjs script. To update the workflow,
# make changes to the template file and run the script again.
######################################################################`);

for (const spec of specs) {
  if (!spec.shortname) {
    spec.shortname = spec.source.split('.')[0].replace(/_/g, '-');
  }
  if (!spec.destination) {
    spec.destination = spec.source.replace(/\.src/, '');
  }
  if (!spec.tokenName) {
    spec.tokenName = 'ECHIDNA_TOKEN_' +
      spec.shortname.toUpperCase()
        .replace(/-/g, '_')
        .replace(/_CODEC_/, '_'); // Tokens don't have "_CODEC_" in their name
  }
  if (spec.additionalPaths) {
    spec.additionalPaths = spec.additionalPaths.map(path => `\n      - '${path}'`).join('');
  }

  let content = template;
  for (const prop of properties) {
    content = content.replace(new RegExp('{{' + prop + '}}', 'g'), spec[prop] ?? '');
  }

  const filename = join(scriptPath, 'workflows', `auto-publish-${spec.shortname}.yml`);
  await writeFile(filename, content, 'utf8');
}
