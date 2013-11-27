var stylekit = require('../');

window.init = function() {

    var styleSet = stylekit();

    styleSet.vars.set('MAIN_COLOR', 'red');
    styleSet.vars.set('SECONDARY_COLOR', 'pink');

    var b1 = styleSet.block();
    b1.appendCSS('h1 { color: $MAIN_COLOR; }');
    b1.commit();

    var b2 = styleSet.block();
    b2.rule('div', {
        border: '5px solid $MAIN_COLOR',
        background: '$SECONDARY_COLOR',
        padding: '30px'
    });
    b2.commit();

    function bindInput(name, v) {
        var input = document.querySelector('input[name=' + name + ']');
        input.value = styleSet.vars.get(v);
        document.querySelector('input[type=button]').addEventListener('click', function() {
            styleSet.vars.set(v, input.value);
        });
    }

    bindInput('main', 'MAIN_COLOR');
    bindInput('secondary', 'SECONDARY_COLOR');

}