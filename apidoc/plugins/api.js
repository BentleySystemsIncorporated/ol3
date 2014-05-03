/**
 * Define an @api tag
 */
var conf = env.conf.stability;
var defaultLevels = ["deprecated","experimental","unstable","stable","frozen","locked"];
var levels = conf.levels || defaultLevels;
var util = require('util');
exports.defineTags = function(dictionary) {
  dictionary.defineTag('api', {
    mustHaveValue: false,
    canHaveType: false,
    canHaveName: false,
    onTagged: function(doclet, tag) {
      var level = tag.text || "experimental";
      if (levels.indexOf(level) >= 0) {
        doclet.stability = level;
      } else {
        var errorText = util.format('Invalid stability level (%s) in %s line %s', tag.text, doclet.meta.filename, doclet.meta.lineno);
        require('jsdoc/util/error').handle( new Error(errorText) );
      }
    }
  });
};



/*
 * Based on @stability annotations, and assuming that items with no @stability
 * annotation should not be documented, this plugin removes undocumented symbols
 * from the documentation. Undocumented classes with documented members get a
 * 'hideConstructur' property, which is read by the template so it can hide the
 * constructor.
 */

function hasApiMembers(doclet) {
  return doclet.longname.split('#')[0] == this.longname;
}

function includeAugments(doclet) {
  var augments = doclet.augments;
  if (augments) {
    var cls;
    for (var i = augments.length - 1; i >= 0; --i) {
      cls = classes[augments[i]];
      if (cls) {
        cls.hideConstructor = true;
        includeAugments(cls);
      }
    }
  }
}

var api = [];
var augments = {};
var classes = {};

exports.handlers = {

  newDoclet: function(e) {
    var doclet = e.doclet;
    // Keep track of api items - needed in parseComplete to determine classes
    // with api members.
    if (doclet.stability) {
      api.push(doclet);
    }
    // Mark explicity defined namespaces - needed in parseComplete to keep
    // namespaces that we need as containers for api items.
    if (/.*\.jsdoc$/.test(doclet.meta.filename) && doclet.kind == 'namespace') {
      doclet.namespace_ = true;
    }
    if (doclet.kind == 'class') {
      classes[doclet.longname] = doclet;
    }
  },

  parseComplete: function(e) {
    var doclets = e.doclets;
    for (var i = doclets.length - 1; i >= 0; --i) {
      var doclet = doclets[i];
      if (doclet.stability || doclet.namespace_) {
        if (doclet.kind == 'class') {
          includeAugments(doclet);
        }
        // Always document namespaces and items with stability annotation
        continue;
      }
      if (doclet.kind == 'class' && api.some(hasApiMembers, doclet)) {
        // Mark undocumented classes with documented members as unexported.
        // This is used in ../template/tmpl/container.tmpl to hide the
        // constructor from the docs.
        doclet.hideConstructor = true;
        includeAugments(doclet);
      } else if (!doclet.hideConstructor) {
        // Remove all other undocumented symbols
        doclet.undocumented = true;
      }
    }
  }

};
