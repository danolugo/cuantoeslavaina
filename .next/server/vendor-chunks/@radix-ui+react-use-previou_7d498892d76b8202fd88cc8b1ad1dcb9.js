"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@radix-ui+react-use-previou_7d498892d76b8202fd88cc8b1ad1dcb9";
exports.ids = ["vendor-chunks/@radix-ui+react-use-previou_7d498892d76b8202fd88cc8b1ad1dcb9"];
exports.modules = {

/***/ "(ssr)/./node_modules/.pnpm/@radix-ui+react-use-previou_7d498892d76b8202fd88cc8b1ad1dcb9/node_modules/@radix-ui/react-use-previous/dist/index.mjs":
/*!**************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@radix-ui+react-use-previou_7d498892d76b8202fd88cc8b1ad1dcb9/node_modules/@radix-ui/react-use-previous/dist/index.mjs ***!
  \**************************************************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   usePrevious: () => (/* binding */ usePrevious)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/.pnpm/next@14.0.4_@babel+core@7.2_4dd0d9bf506f07f172b83f2c542efdce/node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\");\n// packages/react/use-previous/src/use-previous.tsx\n\nfunction usePrevious(value) {\n    const ref = react__WEBPACK_IMPORTED_MODULE_0__.useRef({\n        value,\n        previous: value\n    });\n    return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>{\n        if (ref.current.value !== value) {\n            ref.current.previous = ref.current.value;\n            ref.current.value = value;\n        }\n        return ref.current.previous;\n    }, [\n        value\n    ]);\n}\n //# sourceMappingURL=index.mjs.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vQHJhZGl4LXVpK3JlYWN0LXVzZS1wcmV2aW91XzdkNDk4ODkyZDc2YjgyMDJmZDg4Y2M4YjFhZDFkY2I5L25vZGVfbW9kdWxlcy9AcmFkaXgtdWkvcmVhY3QtdXNlLXByZXZpb3VzL2Rpc3QvaW5kZXgubWpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsbURBQW1EO0FBQ3BCO0FBQy9CLFNBQVNDLFlBQVlDLEtBQUs7SUFDeEIsTUFBTUMsTUFBTUgseUNBQVksQ0FBQztRQUFFRTtRQUFPRyxVQUFVSDtJQUFNO0lBQ2xELE9BQU9GLDBDQUFhLENBQUM7UUFDbkIsSUFBSUcsSUFBSUksT0FBTyxDQUFDTCxLQUFLLEtBQUtBLE9BQU87WUFDL0JDLElBQUlJLE9BQU8sQ0FBQ0YsUUFBUSxHQUFHRixJQUFJSSxPQUFPLENBQUNMLEtBQUs7WUFDeENDLElBQUlJLE9BQU8sQ0FBQ0wsS0FBSyxHQUFHQTtRQUN0QjtRQUNBLE9BQU9DLElBQUlJLE9BQU8sQ0FBQ0YsUUFBUTtJQUM3QixHQUFHO1FBQUNIO0tBQU07QUFDWjtBQUdFLENBQ0Ysa0NBQWtDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY3VhbnRvZXNsYXZhaW5hLy4vbm9kZV9tb2R1bGVzLy5wbnBtL0ByYWRpeC11aStyZWFjdC11c2UtcHJldmlvdV83ZDQ5ODg5MmQ3NmI4MjAyZmQ4OGNjOGIxYWQxZGNiOS9ub2RlX21vZHVsZXMvQHJhZGl4LXVpL3JlYWN0LXVzZS1wcmV2aW91cy9kaXN0L2luZGV4Lm1qcz81ZmU2Il0sInNvdXJjZXNDb250ZW50IjpbIi8vIHBhY2thZ2VzL3JlYWN0L3VzZS1wcmV2aW91cy9zcmMvdXNlLXByZXZpb3VzLnRzeFxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5mdW5jdGlvbiB1c2VQcmV2aW91cyh2YWx1ZSkge1xuICBjb25zdCByZWYgPSBSZWFjdC51c2VSZWYoeyB2YWx1ZSwgcHJldmlvdXM6IHZhbHVlIH0pO1xuICByZXR1cm4gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgaWYgKHJlZi5jdXJyZW50LnZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgcmVmLmN1cnJlbnQucHJldmlvdXMgPSByZWYuY3VycmVudC52YWx1ZTtcbiAgICAgIHJlZi5jdXJyZW50LnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZWYuY3VycmVudC5wcmV2aW91cztcbiAgfSwgW3ZhbHVlXSk7XG59XG5leHBvcnQge1xuICB1c2VQcmV2aW91c1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4Lm1qcy5tYXBcbiJdLCJuYW1lcyI6WyJSZWFjdCIsInVzZVByZXZpb3VzIiwidmFsdWUiLCJyZWYiLCJ1c2VSZWYiLCJwcmV2aW91cyIsInVzZU1lbW8iLCJjdXJyZW50Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/@radix-ui+react-use-previou_7d498892d76b8202fd88cc8b1ad1dcb9/node_modules/@radix-ui/react-use-previous/dist/index.mjs\n");

/***/ })

};
;