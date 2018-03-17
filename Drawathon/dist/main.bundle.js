webpackJsonp(["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app-routing.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppRoutingModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_game_game_component__ = __webpack_require__("./src/app/components/game/game.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_main_main_component__ = __webpack_require__("./src/app/components/main/main.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_chat_chat_component__ = __webpack_require__("./src/app/components/chat/chat.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





var routes = [
    { path: 'game', component: __WEBPACK_IMPORTED_MODULE_2__components_game_game_component__["a" /* GameComponent */] },
    { path: '', component: __WEBPACK_IMPORTED_MODULE_3__components_main_main_component__["a" /* MainComponent */], pathMatch: 'full' },
    { path: 'test', component: __WEBPACK_IMPORTED_MODULE_4__components_chat_chat_component__["a" /* ChatComponent */] }
];
var AppRoutingModule = /** @class */ (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["I" /* NgModule */])({
            imports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* RouterModule */].forRoot(routes)],
            exports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* RouterModule */]]
        })
    ], AppRoutingModule);
    return AppRoutingModule;
}());



/***/ }),

/***/ "./src/app/app.component.css":
/***/ (function(module, exports) {

module.exports = "/* Header Panel that will be on every page except sign.html*/\r\n.panel {\r\n    margin: -10px 0px 0px -10px;\r\n    width: 100%;\r\n    display: -ms-grid;\r\n    display: grid;\r\n    -ms-grid-columns: 25px 30px 100px 1fr 200px 150px;\r\n        grid-template-columns: 25px 30px 100px 1fr 200px 150px;\r\n    -ms-grid-rows: 1fr;\r\n        grid-template-rows: 1fr;\r\n    height: 50px;\r\n    background: white;\r\n}\r\n.icon {\r\n    margin-top:12px;\r\n    -ms-grid-row: 1;\r\n    -ms-grid-row-span: 1;\r\n    -ms-grid-column: 2;\r\n    -ms-grid-column-span: 1;\r\n    grid-area: 1 / 2 / span 1 / span 1;\r\n    font-size:10px;\r\n    width: 25px;\r\n    height: 25px;\r\n}\r\n.header {\r\n    margin-top:12px;\r\n    font-size:25px;\r\n    height: 64px;\r\n    text-decoration: none;\r\n    color: black;\r\n    -webkit-box-pack: center;\r\n        -ms-flex-pack: center;\r\n            justify-content: center;\r\n    -ms-grid-row: 1;\r\n    -ms-grid-row-span: 1;\r\n    -ms-grid-column: 3;\r\n    -ms-grid-column-span: 1;\r\n    grid-area: 1 / 3 / span 1 / span 1;\r\n}\r\n.user_info {\r\n    margin-top:18px;\r\n    -ms-grid-row: 1;\r\n    -ms-grid-row-span: 1;\r\n    -ms-grid-column: 5;\r\n    -ms-grid-column-span: 1;\r\n    grid-area: 1 / 5 / span 1 / span 1;\r\n}\r\n.btn {\r\n    margin-top:18px;\r\n    -ms-grid-row: 1;\r\n    -ms-grid-row-span: 1;\r\n    -ms-grid-column: 6;\r\n    -ms-grid-column-span: 1;\r\n    grid-area: 1 / 6 / span 1 / span 1;\r\n    font-size:15px;\r\n}\r\n"

/***/ }),

/***/ "./src/app/app.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"panel\">\n  <img class=\"icon\" src=\"assets/icon.png\" alt=\"Image not found\">\n  <a class=\"header\" routerLink='/'>Drawathon</a>\n  <p class=\"user_info\">Welcome, Null User</p>\n  <a href=\"./sign.html\" class=\"btn\">Sign In / Sign Up</a>\n</div>\n<router-outlet></router-outlet>\n"

/***/ }),

/***/ "./src/app/app.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common__ = __webpack_require__("./node_modules/@angular/common/esm5/common.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var AppComponent = /** @class */ (function () {
    function AppComponent(location) {
        this.location = location;
        this.title = 'app';
    }
    ;
    AppComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["n" /* Component */])({
            selector: 'app-root',
            template: __webpack_require__("./src/app/app.component.html"),
            styles: [__webpack_require__("./src/app/app.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__angular_common__["f" /* Location */]])
    ], AppComponent);
    return AppComponent;
}());



/***/ }),

/***/ "./src/app/app.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__("./node_modules/@angular/platform-browser/esm5/platform-browser.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_component__ = __webpack_require__("./src/app/app.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_main_main_component__ = __webpack_require__("./src/app/components/main/main.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_game_game_component__ = __webpack_require__("./src/app/components/game/game.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__app_routing_module__ = __webpack_require__("./src/app/app-routing.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_canvas_canvas_component__ = __webpack_require__("./src/app/components/canvas/canvas.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__components_chat_chat_component__ = __webpack_require__("./src/app/components/chat/chat.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};








var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["I" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_2__app_component__["a" /* AppComponent */],
                __WEBPACK_IMPORTED_MODULE_3__components_main_main_component__["a" /* MainComponent */],
                __WEBPACK_IMPORTED_MODULE_4__components_game_game_component__["a" /* GameComponent */],
                __WEBPACK_IMPORTED_MODULE_6__components_canvas_canvas_component__["a" /* CanvasComponent */],
                __WEBPACK_IMPORTED_MODULE_7__components_chat_chat_component__["a" /* ChatComponent */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_5__app_routing_module__["a" /* AppRoutingModule */]
            ],
            providers: [],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_2__app_component__["a" /* AppComponent */]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/app/components/canvas/canvas.component.css":
/***/ (function(module, exports) {

module.exports = ".layout {\r\n    display: -ms-grid;\r\n    display: grid;\r\n    -ms-grid-rows: 10px 800px 10px;\r\n        grid-template-rows: 10px 800px 10px;\r\n    -ms-grid-columns: 10px 800px 10px 50px;\r\n        grid-template-columns: 10px 800px 10px 50px;\r\n}\r\n\r\n.canvas {\r\n    -ms-grid-row: 2;\r\n    -ms-grid-row-span: 1;\r\n    -ms-grid-column: 2;\r\n    -ms-grid-column-span: 1;\r\n    grid-area: 2 / 2 / span 1 / span 1;\r\n    max-width: 800px;\r\n    max-height: 800px;\r\n    min-width: 500px;\r\n    min-height: 500px;\r\n    background-color: white;\r\n}\r\n\r\n.colors {\r\n    -ms-grid-row: 2;\r\n    -ms-grid-row-span: 1;\r\n    -ms-grid-column: 4;\r\n    -ms-grid-column-span: 1;\r\n    grid-area: 2 / 4 / span 1 / span 1;\r\n    display: -webkit-box;\r\n    display: -ms-flexbox;\r\n    display: flex;\r\n    -webkit-box-orient: vertical;\r\n    -webkit-box-direction: normal;\r\n        -ms-flex-direction: column;\r\n            flex-direction: column;\r\n    -webkit-box-pack: justify;\r\n        -ms-flex-pack: justify;\r\n            justify-content: space-between;\r\n    -webkit-box-align: center;\r\n        -ms-flex-align: center;\r\n            align-items: center;\r\n}\r\n\r\n.color{\r\n    border-width: 1px;\r\n    border-style:solid;\r\n    width: 50px;\r\n    height: 50px;\r\n}\r\n\r\n#small{\r\n    border-style: none;\r\n    width: 10px;\r\n    height: 10px;\r\n    border-radius: 10px;\r\n}\r\n\r\n#medium{\r\n    border-style: none;\r\n    width: 25px;\r\n    height: 25px;\r\n    border-radius: 25px;\r\n}\r\n\r\n#large{\r\n    border-style: none;\r\n    width: 50px;\r\n    height: 50px;\r\n    border-radius: 50px;\r\n}"

/***/ }),

/***/ "./src/app/components/canvas/canvas.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"layout\">\n  <canvas #canvas (mousemove)=\"mouseMove($event)\" (mousedown)=\"mouseDown()\" (mouseup)=\"mouseUp()\" class=\"canvas\" width=\"800\" height=\"800\"></canvas>\n  <div class=\"colors\">\n    <div class=\"color\" id=\"large\" [ngStyle]=\"{ 'background-color': color }\" (click)=\"clickSize(50)\"></div>\n    <div class=\"color\" id=\"medium\" [ngStyle]=\"{ 'background-color': color }\" (click)=\"clickSize(25)\"></div>\n    <div class=\"color\" id=\"small\" [ngStyle]=\"{ 'background-color': color }\" (click)=\"clickSize(10)\"></div>\n    <div class=\"color\" id=\"red\" style=\"background-color:red;\" (click)=\"clickColor('red')\"></div>\n    <div class=\"color\" id=\"blue\" style=\"background-color:blue;\" (click)=\"clickColor('blue')\"></div>\n    <div class=\"color\" id=\"green\" style=\"background-color:green;\" (click)=\"clickColor('green')\"></div>\n    <div class=\"color\" id=\"white\" style=\"background-color:white;\" (click)=\"clickColor('white')\"></div>\n    <div class=\"color\" id=\"black\" style=\"background-color:black;\" (click)=\"clickColor('black')\"></div>\n  </div>\n</div>\n\n"

/***/ }),

/***/ "./src/app/components/canvas/canvas.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CanvasComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var CanvasComponent = /** @class */ (function () {
    function CanvasComponent() {
        this.mouseDown = function () {
            this.pressed = true;
        };
        this.mouseUp = function () {
            this.pressed = false;
        };
    }
    CanvasComponent.prototype.ngOnInit = function () {
        this.color = "black";
        this.pts = { x: 0, y: 0, px: 0, py: 0 };
        this.pressed = false;
    };
    CanvasComponent.prototype.ngAfterViewInit = function () {
        var canvasEvent = this.canvas.nativeElement;
        this.ctx = canvasEvent.getContext('2d');
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = 10;
        this.bound = canvasEvent.getBoundingClientRect();
    };
    CanvasComponent.prototype.mouseMove = function (event) {
        this.pts.px = this.pts.x;
        this.pts.py = this.pts.y;
        this.pts.x = event.clientX - this.bound.left;
        this.pts.y = event.clientY - this.bound.top;
        if (this.pressed && event.clientX < this.bound.right && event.clientX > this.bound.left && event.clientY < this.bound.bottom && event.clientY > this.bound.top) {
            //draw(api.pushStroke(pts.x, pts.y, pts.px, pts.py, color));
            this.draw();
        }
    };
    CanvasComponent.prototype.draw = function () {
        this.ctx.beginPath();
        this.ctx.moveTo(this.pts.px, this.pts.py);
        this.ctx.lineTo(this.pts.x, this.pts.y);
        this.ctx.strokeStyle = this.color;
        this.ctx.closePath();
        this.ctx.stroke();
    };
    CanvasComponent.prototype.clickColor = function (color) {
        this.color = color;
        console.log(color);
    };
    CanvasComponent.prototype.clickSize = function (size) {
        this.ctx.lineWidth = size;
    };
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_8" /* ViewChild */])('canvas'),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_0__angular_core__["t" /* ElementRef */])
    ], CanvasComponent.prototype, "canvas", void 0);
    CanvasComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["n" /* Component */])({
            selector: 'app-canvas',
            template: __webpack_require__("./src/app/components/canvas/canvas.component.html"),
            styles: [__webpack_require__("./src/app/components/canvas/canvas.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], CanvasComponent);
    return CanvasComponent;
}());



/***/ }),

/***/ "./src/app/components/chat/chat.component.css":
/***/ (function(module, exports) {

module.exports = ".chat {\r\n    width: 500px;\r\n    height: 600px;\r\n    display: -ms-grid;\r\n    display: grid;\r\n    background-color: silver;\r\n    -ms-grid-rows: 50px 1fr 50px;\r\n        grid-template-rows: 50px 1fr 50px;\r\n    -ms-grid-columns: 1fr;\r\n        grid-template-columns: 1fr; \r\n}\r\n.chatTitle {\r\n    -ms-grid-row: 1;\r\n    -ms-grid-row-span: 1;\r\n    -ms-grid-column: 1;\r\n    -ms-grid-column-span: 1;\r\n    grid-area: 1 / 1 / span 1 / span 1;\r\n    color:black;\r\n    height: 50px;\r\n    font-family: 'Lucida Calligraphy';\r\n\r\n    display:-webkit-box;\r\n\r\n    display:-ms-flexbox;\r\n\r\n    display:flex;\r\n    -webkit-box-pack: center;\r\n        -ms-flex-pack: center;\r\n            justify-content: center;\r\n    -webkit-box-align: center;\r\n        -ms-flex-align: center;\r\n            align-items: center;\r\n    font-size: 25px;\r\n    background-color: beige;\r\n}\r\n.chatContent {\r\n    -ms-grid-row: 2;\r\n    -ms-grid-row-span: 1;\r\n    -ms-grid-column: 1;\r\n    -ms-grid-column-span: 1;\r\n    grid-area: 2 / 1 / span 1 / span 1;\r\n    color:white;\r\n    background: grey;\r\n    display: -webkit-box;\r\n    display: -ms-flexbox;\r\n    display: flex;\r\n    font-size: 15px;\r\n    text-align: center;\r\n    -webkit-box-orient: vertical;\r\n    -webkit-box-direction: normal;\r\n        -ms-flex-direction: column;\r\n            flex-direction: column;\r\n    -webkit-box-align: center;\r\n        -ms-flex-align: center;\r\n            align-items: center;\r\n    -webkit-box-pack: start;\r\n        -ms-flex-pack: start;\r\n            justify-content: flex-start;\r\n}\r\n.chatText {\r\n    -ms-grid-row: 3;\r\n    -ms-grid-row-span: 1;\r\n    -ms-grid-column: 1;\r\n    -ms-grid-column-span: 1;\r\n    grid-area: 3 / 1 / span 1 / span 1;\r\n    color: black;\r\n    resize: none;\r\n    font-size: 15px;\r\n    background: white;\r\n}\r\n.chatMessage {\r\n    display: -webkit-box;\r\n    display: -ms-flexbox;\r\n    display: flex;\r\n    margin: 5px 5px 5px 5px;\r\n    -webkit-box-pack: center;\r\n        -ms-flex-pack: center;\r\n            justify-content: center;\r\n    -webkit-box-align: center;\r\n        -ms-flex-align: center;\r\n            align-items: center;\r\n    border-radius: 5px;\r\n    height: auto;\r\n    width: 400px;\r\n    background-color: skyblue;\r\n}\r\n.chatButton {\r\n    -ms-grid-row: 3;\r\n    -ms-grid-row-span: 1;\r\n    -ms-grid-column: 1;\r\n    -ms-grid-column-span: 1;\r\n    grid-area: 3 / 1 / span 1 / span 1;\r\n    width: 40px;\r\n    height: 40px;\r\n    border-radius: 40px;\r\n    background-color: skyblue;\r\n    justify-self: flex-end;\r\n    -ms-flex-item-align: end;\r\n        align-self: flex-end;\r\n}\r\n.chatButton:hover {\r\n    cursor: pointer;\r\n}"

/***/ }),

/***/ "./src/app/components/chat/chat.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"chat\">\n    <div class=\"chatTitle\">Gamer's Only Chat</div>\n    <div class=\"chatContent\">\n        <div class=\"chatMessage\" *ngFor=\"let message of messages\">{{message}}</div>\n    </div>\n    <textarea #textarea class=\"chatText\" rows=\"1\" ngModel=\"message\"></textarea>\n    <img class=\"chatButton\" src=\"assets/send.png\" (click)=\"submitMessage()\">\n</div>\n"

/***/ }),

/***/ "./src/app/components/chat/chat.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ChatComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var ChatComponent = /** @class */ (function () {
    function ChatComponent() {
    }
    ChatComponent.prototype.ngOnInit = function () {
        this.messages = [];
    };
    ChatComponent.prototype.submitMessage = function () {
        this.messages.push("Null User: " + this.textarea.nativeElement.value);
        this.textarea.nativeElement.value = "";
    };
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_8" /* ViewChild */])('textarea'),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_0__angular_core__["t" /* ElementRef */])
    ], ChatComponent.prototype, "textarea", void 0);
    ChatComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["n" /* Component */])({
            selector: 'app-chat',
            template: __webpack_require__("./src/app/components/chat/chat.component.html"),
            styles: [__webpack_require__("./src/app/components/chat/chat.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], ChatComponent);
    return ChatComponent;
}());



/***/ }),

/***/ "./src/app/components/game/game.component.css":
/***/ (function(module, exports) {

module.exports = ".layout {\r\n    display: -ms-grid;\r\n    display: grid;\r\n    width:100%;\r\n    height:auto;\r\n    -ms-grid-columns: 50% 10% 40%;\r\n        grid-template-columns: 50% 10% 40%;\r\n    -ms-grid-rows: 1fr 1fr;\r\n        grid-template-rows: 1fr 1fr;\r\n}\r\n\r\n.gimg {\r\n    border-style: double;\r\n    border-width: 2px;\r\n    -ms-grid-row: 1;\r\n    -ms-grid-row-span: 1;\r\n    -ms-grid-column: 3;\r\n    -ms-grid-column-span: 1;\r\n    grid-area: 1 / 3 / span 1 / span 1;\r\n    margin: 5% 5% 5% 5%;\r\n    width: 90%;\r\n    height: 90%;\r\n    max-width: 500px;\r\n    max-height: 500px;\r\n    min-width: 500px;\r\n    min-height: 200px;\r\n}"

/***/ }),

/***/ "./src/app/components/game/game.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"layout\">\n  <img class=\"gimg\" src=\"assets/sample.png\" alt=\"Image not found\">\n\n</div>\n\n"

/***/ }),

/***/ "./src/app/components/game/game.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GameComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs_add_observable_fromEvent__ = __webpack_require__("./node_modules/rxjs/_esm5/add/observable/fromEvent.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var GameComponent = /** @class */ (function () {
    function GameComponent() {
    }
    GameComponent.prototype.ngOnInit = function () {
    };
    GameComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["n" /* Component */])({
            selector: 'app-game',
            template: __webpack_require__("./src/app/components/game/game.component.html"),
            styles: [__webpack_require__("./src/app/components/game/game.component.css")],
        }),
        __metadata("design:paramtypes", [])
    ], GameComponent);
    return GameComponent;
}());



/***/ }),

/***/ "./src/app/components/main/main.component.css":
/***/ (function(module, exports) {

module.exports = ".gamesContainer {\r\n    display: -webkit-box;\r\n    display: -ms-flexbox;\r\n    display: flex;\r\n    -webkit-box-orient: vertical;\r\n    -webkit-box-direction: normal;\r\n        -ms-flex-direction: column;\r\n            flex-direction: column;\r\n    -webkit-box-pack: start;\r\n        -ms-flex-pack: start;\r\n            justify-content: flex-start;\r\n    -webkit-box-align: center;\r\n        -ms-flex-align: center;\r\n            align-items: center;\r\n    height: auto;\r\n    width: 800px;\r\n    padding: 10px 0px 10px 0px;\r\n    background:rgb(167, 162, 162);\r\n}\r\n\r\n.gameElement {\r\n    display: -webkit-box;\r\n    display: -ms-flexbox;\r\n    display: flex;\r\n    -webkit-box-orient: horizontal;\r\n    -webkit-box-direction: normal;\r\n        -ms-flex-direction: row;\r\n            flex-direction: row;\r\n    -webkit-box-pack: start;\r\n        -ms-flex-pack: start;\r\n            justify-content: flex-start;\r\n    -webkit-box-align: center;\r\n        -ms-flex-align: center;\r\n            align-items: center;\r\n    width: 750px;\r\n    height: 100px;\r\n    margin: 10px 10px 10px 10px;\r\n    background: slategray;\r\n    border-radius: 10px;\r\n\r\n}\r\n\r\n.gameThumbnail {\r\n    width: 50px;\r\n    height: 50px;\r\n    padding: 10px 40px 10px 40px;\r\n}\r\n\r\n.gameTitle {\r\n    font-size: 16px;\r\n    text-decoration: none;\r\n    color: white;\r\n}\r\n\r\n.title {\r\n    font-style: italic;\r\n}\r\n\r\n.gameElement:hover{\r\n    cursor: pointer;\r\n}"

/***/ }),

/***/ "./src/app/components/main/main.component.html":
/***/ (function(module, exports) {

module.exports = "<h1 class=\"title\">Public Games Available</h1>\n<div class=\"gamesContainer\">\n  <div *ngFor=\"let game of games\" (click)=\"clickGame(game)\">\n    <a routerLink=\"/game\">\n    <div class=\"gameElement\">\n      <img class=\"gameThumbnail\" src=\"assets/sample.png\" alt=\"Could not find image.\">\n      <p class=\"gameTitle\">{{game}}</p>\n    </div>\n   </a>\n  </div>\n</div>\n\n"

/***/ }),

/***/ "./src/app/components/main/main.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MainComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var MainComponent = /** @class */ (function () {
    function MainComponent() {
    }
    MainComponent.prototype.ngOnInit = function () {
        //Load games
        this.games = ["fakeGame1", "fakeGame2", "fakeGame3", "fakeGame4", "fakeGame5"];
        console.log(this.games);
    };
    MainComponent.prototype.clickGame = function (game) {
    };
    MainComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["n" /* Component */])({
            selector: 'app-main',
            template: __webpack_require__("./src/app/components/main/main.component.html"),
            styles: [__webpack_require__("./src/app/components/main/main.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], MainComponent);
    return MainComponent;
}());



/***/ }),

/***/ "./src/environments/environment.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
var environment = {
    production: false
};


/***/ }),

/***/ "./src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__("./node_modules/@angular/platform-browser-dynamic/esm5/platform-browser-dynamic.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__("./src/app/app.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__("./src/environments/environment.ts");




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_13" /* enableProdMode */])();
}
Object(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */])
    .catch(function (err) { return console.log(err); });


/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("./src/main.ts");


/***/ })

},[0]);
//# sourceMappingURL=main.bundle.js.map