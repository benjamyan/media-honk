
## Sitepoint breakdown of MVC patterns
### https://www.sitepoint.com/mvc-design-pattern-javascript/

                        ___________________________
                        |                         |
                        |    PenguinController    |
                        |_________________________|
              ______________________|______________________
              |                                            |
___________________________                   ___________________________
|                         |                   |                         |
|       PenguinView       |                   |      PenguinModel       |
|_________________________|                   |_________________________|                 


#### The `PenguinController` handles events and is the mediator between the view and model. 
It works out what happens when the user performs an action (for example, clicking on a button or pressing a key). Client-side specific logic can go in the controller. In a bigger system, where there is a lot going on, you can break it out into modules. The controller is the entry point for events and the only mediator between the view and data.

#### The `PenguinView` cares about the DOM. 
The DOM is the browser API you use to make HTML manipulations. In MVC, no other part cares about changing the DOM except for the view. The view can attach user events but leaves event handling concerns to the controller. The view’s prime directive is to change the state of what the user sees on the screen. For this demo, the view will do the DOM manipulations in plain JavaScript.

#### The `PenguinModel` cares about data. 
In client-side JavaScript, this means Ajax. One advantage of the MVC pattern is you now have a single place for server-side Ajax calls. This makes it inviting for fellow programmers who are not familiar with the solution. The model in this design pattern cares only about JSON or objects that come from the server.
