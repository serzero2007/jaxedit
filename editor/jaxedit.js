
/* JaxEdit: online LaTeX editor with live preview
 * Copyright (c) 2011-2014 JaxEdit project
 * License: GNU Lesser General Public License, Version 3
 *
 * Website: http://jaxedit.com
 * Source:  https://github.com/zohooo/jaxedit
 * Release: http://code.google.com/p/jaxedit/
 */

window.jaxedit = (function ($) {
	var gatepath = "",
		mathname = "MathJax.js?config=TeX-AMS_HTML",
		mathpath = "";

	return {
		autoScroll : false,
		fileid : 0,
		hasEditor : false,
		hasParser : false,
		version : "0.33 lite",
		view : "half",
		wcode : null,

		options : {
			debug : "none",
			localjs : false
		},

		childs : {
			html : document.documentElement,
			body : document.body,
			wrap : document.getElementById("wrap"),
			head : document.getElementById("head"),
			main : document.getElementById("main"),
			left : document.getElementById("left"),
			ltop : document.getElementById("ltop"),
			source : document.getElementById("source"),
			codearea : document.getElementById("codearea"),
			lbot : document.getElementById("lbot"),
			resizer : document.getElementById("resizer"),
			right : document.getElementById("right"),
			rtop : document.getElementById("rtop"),
			preview : document.getElementById("preview"),
			showarea : document.getElementById("showarea"),
			rbot : document.getElementById("rbot")
		},

		scrollers : {
			codelength : 0,
			codechange : 0,
			codescroll : 0,
			showscroll : 0,
			showheight : 1,
			divheights : []
		},

		textdata : {
			oldtextvalue : "",
			oldtextsize : 0,
			oldselstart : 0,
			oldselend : 0,
			oldseltext : "",
			newtextvalue : "",
			newtextsize : 0,
			newselstart : 0,
			newselend : 0,
			newseltext : ""
		},

		getOptions : function () {
			var options = this.options,
				agent = $.agent,
				browser =agent.browser,
				version = agent.version;
			options.localjs = (location.protocol == "file:" || location.protocol == "https:");

			var qs = location.search.length > 0 ? location.search.substring(1) : "";
			var items = qs.split("&"),
				pair,
				name,
				value;
				
			var i;
			for (i = 0; i < items.length; i++) {
				pair = items[i].split("=");
				if (pair.length == 1) {
					var id = parseInt(pair[0]);
					if (isFinite(id)) this.fileid = id;
					continue;
				}
				name = decodeURIComponent(pair[0]);
				value = pair[1] ? decodeURIComponent(pair[1]) : "";
				switch (typeof options[name]) {
				case "boolean":
					if (value == "true" || value == "1") {
						options[name] = true;
					} else if (value == "false" || value == "0") {
						options[name] = false;
					}
					break;
				case "number":
					value = parseFloat(value);
					if (!isNaN(value)) {
						options[name] = value;
					}
					break;
				case "string":
					options[name] = value;
					break;
				}
			}

			mathpath = options.localjs ? "library/mathjax/unpacked/" : "http://cdn.mathjax.org/mathjax/2.1-latest/";
		},

		doResize : function (clientX) {
			var that = this;
			var childs = that.childs,
				html = childs.html,
				body = childs.body,
				left = childs.left,
				resizer = childs.resizer,
				right = childs.right,
				preview = childs.preview,
				showarea = childs.showarea;

			var pageWidth = window.innerWidth;
			var pageHeight = window.innerHeight;
			if (typeof pageWidth != "number") {
				if (document.compatMode == "CSS1Compat") {
					pageWidth = document.documentElement.clientWidth;
					pageHeight = document.documentElement.clientHeight;
				} else {
					pageWidth = document.body.clientWidth;
					pageHeight = document.body.clientHeight;
				}
			}

			if (typeof clientX == "number") { // resizer
				if (clientX < 80) clientX = 2;
				if (pageWidth - clientX < 80) clientX = pageWidth - 2;
				left.style.right = pageWidth - clientX + "px";
				right.style.left = clientX + "px";
				resizer.style.left = clientX - 2 + "px";
				return;
			} else {
				left.removeAttribute("style");
				right.removeAttribute("style");
				resizer.removeAttribute("style");
				preview.removeAttribute("style");
				showarea.removeAttribute("style");
			}

			var view = this.view;
			if (pageWidth > 540 && (view == "code" || view == "show")) {
				this.view = "half";
			} else if (pageWidth <= 540 && (view == "half" || view == "quad") && !($.agent.browser == "msie" && $.agent.version < 9)) {
				if (view == "quad")
					setTimeout(function () {typejax.updater.initMode("full");}, 0);
				this.view = "code";
			}

			html.id = "view-" + this.view;
		},

		loadEditor : function () {
			var that = this;
			$.loadScript("editor/textarea/simple.js", function () {
				that.addEditor();
				that.hasEditor = true;
				that.initialize();
			});

		},

		loadParser : function () {
			var that = this;
			var script = document.createElement("script");
			script.type = "text/x-mathjax-config";
			script[(window.opera ? "innerHTML" : "text")] =
				"MathJax.Hub.Config({\n" +
				"  skipStartupTypeset: true,\n" +
				"  TeX: { extensions: ['color.js', 'extpfeil.js'] },\n" +
				"  'HTML-CSS': { imageFont: null }\n" +
				"});"
				document.body.appendChild(script);

			$.loadStyles("typejax/typejax.css");
			$.loadScript("typejax/typejax.js", function () {
				$.loadScript(mathpath + mathname, function () {
					MathJax.Hub.processUpdateTime = 200;
					MathJax.Hub.processUpdateDelay = 15;
					that.hasParser = true;
					that.initialize();
				});
			});
		},

		initialize : function () {
			if (this.hasEditor && this.hasParser) {
				this.initEditor();
				this.bindView();
			}
		},

		initEditor : function (value) {
			var childs = this.childs,
				codearea = childs.codearea,
				lbot = childs.lbot,
				showarea = childs.showarea;
			var editor = this.editor,
				scrollers = this.scrollers,
				data = this.textdata;
			var highlight = this.options.highlight;

			if (!highlight && $.agent.browser == "msie") codearea.setActive();
			if (typeof value == "string") { editor.setValue(value); }
			data.newtextvalue = editor.getValue();
			data.newtextsize = data.newtextvalue.length;
			if (!highlight) {
				data.newselstart = codearea.selectionStart;
				data.newselend = codearea.selectionEnd;
			}

			lbot.innerHTML = "size: " + data.newtextsize + "; textarea: initialized";
			
			editor.setReadOnly(true);
			this.addHooks();
			typejax.message.debug = this.options.debug;
			typejax.updater.init(data.newtextvalue, data.newtextsize, showarea);
			this.addHandler();
			editor.setReadOnly(false);
		},

		addHooks : function () {
			var childs = this.childs,
				showarea = childs.showarea,
				updater = typejax.updater;

			function resizeShow(isAll) {
				var source = childs.source,
					right = childs.right,
					preview = childs.preview,
					size;

				showarea.style.visibility = "hidden";

				showarea.style.width = "20px";
				var mw = source.clientWidth,
					cw = showarea.clientWidth,
					sw = showarea.scrollWidth,
					size = Math.max(Math.min(sw + 30, 0.618 * mw), 0.382 * mw);
				right.style.width = size + "px";
				preview.style.width = (size - 6) + "px";
				showarea.style.width = (size - 8) + "px";

				showarea.style.height = "20px";
				var mh = source.clientHeight,
					ch = showarea.clientHeight,
					sh = showarea.scrollHeight;
				size = Math.min(sh + 10, 0.5 * mh);
				right.style.height = size + "px";
				preview.style.height = (size - 6) + "px";
				showarea.style.height = (size - 10) + "px";

				showarea.style.visibility = "visible";

				this.autoScroll = isAll;
			}

			function scrollView(start) {
				if (showarea.childNodes.length > start) { // sometimes showarea is empty
					this.autoScroll = false;
					showarea.childNodes[start].scrollIntoView(true);
					showarea.scrollTop -= 60;
					setTimeout(function () {jaxedit.autoScroll = true;}, 500); // after scroll event
				}
				// for scrollbar following
				this.scrollers.showscroll = showarea.scrollTop;
			}

			function updateHeight(start, end, innerdata) {
				var divheights = this.scrollers.divheights,
					showheight = this.scrollers.showheight;
				var totaldata = typejax.totaldata,
					data,
					height,
					i;
				divheights.splice(start, end - start);
				for (i = 0; i < innerdata.length; i++) {
					data = innerdata[i];
					height = showarea.childNodes[start + i].scrollHeight;
					divheights.splice(start + i, 0, [data.from, data.to, height]);
				}
				for (i = start + innerdata.length; i < totaldata.length; i++) {
					data = totaldata[i];
					divheights[i][0] = data.from;
					divheights[i][1] = data.to;
				}
				showheight = 0;
				for (i = 0; i < divheights.length; i++) {
					showheight += divheights[i][2];
				}
				this.scrollers.showheight = (showheight > 0) ? showheight : 1;
				//console.log("divheights:", showheight, divheights);
			}

			updater.addHook("After Typeset Tiny", this, resizeShow);
			updater.addHook("After Typeset Full", this, scrollView);
			updater.addHook("After Typeset Full", this, updateHeight);
		},

		doLoad : function () {
			var codearea = this.childs.codearea,
				showarea = this.childs.showarea;
			this.getOptions();
			this.autoScroll = false;
			if (window.localStorage && this.fileid <= 0) {
				if (localStorage.getItem("texcode")) {
					codearea.value = localStorage.getItem("texcode");
				}
				if (localStorage.getItem("scroll")) {
					codearea.scrollTop = parseInt(localStorage.getItem("scroll"));
				}
			}
			this.showWindow();
			this.loadEditor();
			console.log("Editor Loaded");
			showarea.innerHTML = "<div id='parser-loading'><i class='gif-loading'></i>Loading TypeJax and MathJax...</div>";

			this.loadParser();
			console.log("Parser Loaded");
		},

		showWindow : function () {
			this.doResize();
			this.childs.wrap.style.visibility = "visible";
			this.addResizer();
		},

		addResizer : function () {
			var resizer = this.childs.resizer,
				main = this.childs.main;
			var that = this;

			resizer.onmousedown = function (event) {
				that.forResize = true;
				var ev = event ? event : window.event;
				if (ev.preventDefault) {
					ev.preventDefault();
				} else {
					ev.returnValue = false;
				}
			};

			main.onmousemove = function (event) {
				if (that.forResize) {
					var ev = event ? event : window.event;
					var x = (ev.clientX > 2) ? ev.clientX - 2 : 0;
					var style = resizer.style;
					style.position = "absolute";
					style.margin = "0";
					style.left = x + "px";
				}
			};

			resizer.onmouseup = function (event) {
				if (that.forResize) {
					var ev = event ? event : window.event;
					that.doResize(ev.clientX);
				}
				that.forResize = false;
			};
		},



		bindView : function () {
			var that = this;
			var quad = document.getElementById("toggle-quadview"),
			half = document.getElementById("toggle-halfview"),
			code = document.getElementById("toggle-codeview"),
			show = document.getElementById("toggle-showview");

			quad.onclick = function () 
				{that.view = "quad";that.doResize();typejax.updater.initMode("tiny"); };
			half.onclick = function () 
				{that.view = "half"; that.doResize();typejax.updater.initMode("full");};
			code.onclick = function () {that.view = "code";that.doResize();};
			show.onclick = function () {that.view = "show";that.doResize();};
		}

	}
})(inliner);

window.onload = function () {
	jaxedit.doLoad()
};
window.onresize = function () {
	jaxedit.doResize()
};
