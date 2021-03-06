/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { deleteAll, read, write } from '../../lib';
import { dirname, sep } from 'path';
import pkgUp from 'pkg-up';
import globby from 'globby';

export async function getDllEntries(manifestPath, whiteListedModules) {
  const manifest = JSON.parse(await read(manifestPath));

  if (!manifest || !manifest.content) {
    // It should fails because if we don't have the manifest file
    // or it is malformed something wrong is happening and we
    // should stop
    throw new Error(`The following dll manifest doesn't exists: ${manifestPath}`);
  }

  const modules = Object.keys(manifest.content);
  if (!modules.length) {
    // It should fails because if we don't have any
    // module inside the client vendors dll something
    // wrong is happening and we should stop too
    throw new Error(`The following dll manifest is reporting an empty dll: ${manifestPath}`);
  }

  // Only includes modules who are not in the white list of modules
  // and that are node_modules
  return modules.filter(entry => {
    const isWhiteListed = whiteListedModules.some(nonEntry => entry.includes(`node_modules${sep}${nonEntry}${sep}`));
    const isNodeModule = entry.includes('node_modules');

    return !isWhiteListed && isNodeModule;
  });
}

export async function cleanDllModuleFromEntryPath(logger, entryPath) {
  const modulePkgPath = await pkgUp(entryPath);
  const modulePkg = JSON.parse(await read(modulePkgPath));
  const moduleDir = dirname(modulePkgPath);

  // Cancel the cleanup for this module as it
  // was already done.
  if (modulePkg.cleaned) {
    return;
  }

  // Clear dependencies from dll module package.json
  if (modulePkg.dependencies) {
    modulePkg.dependencies = {};
  }

  // Clear devDependencies from dll module package.json
  if (modulePkg.devDependencies) {
    modulePkg.devDependencies = {};
  }

  // Delete module contents. It will delete everything
  // excepts package.json, images and css
  //
  // NOTE: We can't use cwd option with globby
  // until the following issue gets closed
  // https://github.com/sindresorhus/globby/issues/87
  const deletePatterns = await globby([
    `${moduleDir}/**`,
    `!${moduleDir}/**/*.+(css)`,
    `!${moduleDir}/**/*.+(gif|ico|jpeg|jpg|tiff|tif|svg|png|webp)`,
    `!${modulePkgPath}`,
  ]);
  await deleteAll(logger, deletePatterns);

  // Mark this module as cleaned
  modulePkg.cleaned = true;

  // Rewrite modified package.json
  await write(
    modulePkgPath,
    JSON.stringify(modulePkg, null, 2)
  );
}

export async function writeEmptyFileForDllEntry(entryPath) {
  await write(
    entryPath,
    ''
  );
}
