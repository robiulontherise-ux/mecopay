const fs = require('fs');
const file = '/app/applet/src/mysite/types.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/export interface Category {/, "export interface Category {\n  client_id?: string;");
code = code.replace(/export interface Post {/, "export interface Post {\n  client_id?: string;");
code = code.replace(/export interface SiteSettings {/, "export interface SiteSettings {\n  client_id?: string;");

fs.writeFileSync(file, code);
