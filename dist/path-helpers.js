'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cjson = require('cjson');

var _cjson2 = _interopRequireDefault(_cjson);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pathIsAbsolute = require('path-is-absolute');

var _pathIsAbsolute2 = _interopRequireDefault(_pathIsAbsolute);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!_path2.default.isAbsolute) _path2.default.isAbsolute = _pathIsAbsolute2.default;

var basePath = getBasePath(process.cwd().replace(/\\/g, '/'));

function getBasePath(directory) {
  if (_fs2.default.existsSync(_path2.default.join(directory, '.meteor'))) {
    return directory;
  }
  var pathAbove = _path2.default.resolve(directory, '..');
  if (pathAbove === directory) {
    console.warn('No .meteor directory found in the path tree; PathHelpers.basePath must be set manually.');
    return null;
  }
  return getBasePath(pathAbove);
}

exports.default = {
  get basePath() {
    return basePath;
  },

  set basePath(newPath) {
    basePath = newPath;
  },

  getPathInPackage: function getPathInPackage(inputFile) {
    if (inputFile.getPackageName() === null) {
      return _path2.default.join(basePath, inputFile.getPathInPackage()).replace(/\\/g, '/');
    }
    return _path2.default.join(basePath, 'packages', inputFile.getPackageName().replace(':', '_'), inputFile.getPathInPackage()).replace(/\\/g, '/');
  },
  getAbsolutePath: function getAbsolutePath(relativePath) {
    if (_path2.default.isAbsolute(relativePath)) {
      return relativePath.replace(/\\/g, '/');
    }

    return _path2.default.join(basePath, relativePath).replace(/\\/g, '/');
  },
  getAppRelativePath: function getAppRelativePath(absolutePath) {
    return '/' + _path2.default.relative(basePath, absolutePath).replace(/\\/g, '/');
  },
  getPathRelativeToFile: function getPathRelativeToFile(importPath, relativeTo) {
    importPath = importPath.replace(/^["']|["']$/g, '');
    var relativePath = relativeTo.replace(/(.*)\/.*/, '$1');
    if (importPath[0] === '~') {
      return getModulePath(importPath.substring(1));
    }

    // Fix relative paths that don't start with ./
    if (['.', '/', '~', '{'].indexOf(importPath[0]) === -1 && !importPath.match(/^[A-Za-z]:/)) {
      importPath = './' + importPath;
    }

    if (importPath[0] === '.') {
      importPath = _path2.default.join(relativePath, importPath);
    }

    importPath = convertCurlySyntaxToAbsolutePath(importPath);

    return importPath.replace(/\\/g, '/');

    function getModulePath(importPath) {
      var nodeModulesDir = basePath + '/node_modules';
      if (importPath.match(/\//)) {
        return nodeModulesDir + '/' + importPath;
      }

      var modulePath = nodeModulesDir + '/' + importPath;
      var mainFile = _cjson2.default.load(modulePath + '/package.json').main;
      return modulePath + '/' + mainFile;
    }

    function convertCurlySyntaxToAbsolutePath(importPath) {
      var accPosition = importPath.indexOf('{');
      if (accPosition === -1) {
        return importPath;
      }

      importPath = importPath.substr(accPosition, importPath.length);
      if (importPath.indexOf('{}') === 0) {
        return _path2.default.join(basePath, importPath.substring(2));
      }

      return _path2.default.join(basePath, 'packages/' + importPath.replace(/\{(.*?):(.*?)}/, '$1_$2').replace(/\{(.*?)}/, '$1'));
    }
  }
};
//# sourceMappingURL=path-helpers.js.map
