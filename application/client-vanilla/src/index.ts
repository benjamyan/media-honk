import Controller from './controller';
import View from './view';
import Model from './model';

(function(){
    // const controller = new Controller({Model, View});

    new Controller({Model, View}).init();

})();

