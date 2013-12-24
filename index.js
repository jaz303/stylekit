var styleTag    = require('style-tag'),
    builder     = require('css-builder'),
    wmap        = require('wmap');

var VAR_RE      = /\$[\w-]+/g;

//
//

function StyleSet(doc) {
    
    this._document = doc || global.document || document;
    this._blocks = [];
    
    this.vars = wmap();
    
    this.vars.getInt = function(key) {
        var val = this.get(key);
        return (typeof val === 'undefined')
                ? Number.NaN
                : parseInt(val, 10);
    }

    this.vars.getFloat = function(key) {
        var val = this.get(key);
        return (typeof val === 'undefined')
                ? Number.NaN
                : parseFloat(val, 10);
    }

}

StyleSet.prototype.block = function() {
    var block = new StyleBlock(this);
    this._blocks.push(block);
    return block;
}

//
//

function StyleBlock(set) {
    this._styleSet = set;
    this._styleTag = null;
    this._unwatch = null;
    this._builder = null;

    this._css = '';
}

StyleBlock.prototype.appendCSS = function(css) {
    this._checkMutable();
    this._css += css;
    return this;
}

StyleBlock.prototype.commit = function() {

    if (this._styleTag !== null)
        return;

    if (this._builder)
        this._builder.commit();

    this._watchReferencedVariables();

    this._styleTag = styleTag(this._styleSet._document, this._cssWithVariableExpansion());

}

StyleBlock.prototype.destroy = function() {
    if (this._styleTag) {
        this._styleTag.destroy();
        this._styleTag = false;
        this._unwatch();
        this._unwatch = null;
    }
}

StyleBlock.prototype.rule = function(selector, rs) {
    if (this._builder === null) {
        this._builder = builder({
            append: this.appendCSS.bind(this)
        });
    }
    return this._builder.rule(selector, rs);
}

StyleBlock.prototype._watchReferencedVariables = function() {

    var matches = this._css.match(VAR_RE) || [],
        referencedVariables = matches.map(function(v) { return v.substr(1); });

    this._unwatch = this._styleSet.vars.watch(referencedVariables, function() {
        this._styleTag(this._cssWithVariableExpansion());
    }.bind(this));

}

StyleBlock.prototype._cssWithVariableExpansion = function() {
    var vars = this._styleSet.vars;

    var css = this._css;
    while (css.match(VAR_RE)) {
        css = css.replace(VAR_RE, function(m) {
            return vars.get(m.substr(1));
        });
    }

    return css;
}

StyleBlock.prototype._checkMutable = function() {
    if (this._styleTag !== null) {
        throw new Error("style block is immutable - style tag already created");
    }
}

//
//

module.exports = function(doc) {
    return new StyleSet(doc);
}