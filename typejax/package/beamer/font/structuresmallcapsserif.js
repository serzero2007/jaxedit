
/* JaxEdit: online LaTeX editor with live preview
 * Copyright (c) 2011-2014 JaxEdit project
 * License: The MIT License
 *
 * Website: http://jaxedit.com
 * Source:  https://github.com/zohooo/jaxedit
 * Release: http://code.google.com/p/jaxedit/
 */

(function(){
  var definitions = {environment: {}, command: {}};
  var renderers = {};

  var styles = {
    "h1, div.frametitle, div.framesubtitle, .thmhead": {
      "font-family": "Georgia, 'Times New Roman', Times, serif",
      "font-variant": "small-caps"
    }
  };

  typejax.parser.extend("beamer/font/structuresmallcapsserif", definitions, renderers, styles);
})();
