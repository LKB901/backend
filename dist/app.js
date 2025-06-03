"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// backend/src/app.ts
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
/* 개별 도메인 라우터 */
const agent_routes_1 = __importDefault(require("./routes/agent.routes"));
const contract_routes_1 = __importDefault(require("./routes/contract.routes"));
const property_routes_1 = __importDefault(require("./routes/property.routes"));
const registry_routes_1 = __importDefault(require("./routes/registry.routes"));
const pass_routes_1 = __importDefault(require("./routes/pass.routes"));
exports.app = (0, express_1.default)();
/* ── 공통 미들웨어 ── */
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
/* ── “/api/index” 프리픽스용 Router ── */
const router = (0, express_1.Router)();
// REST 엔드포인트
router.use('/agents', agent_routes_1.default);
router.use('/contracts', contract_routes_1.default);
router.use('/properties', property_routes_1.default);
router.use('/registry', registry_routes_1.default);
router.use('/pass', pass_routes_1.default);
// 헬스 체크
router.get('/health', (_req, res) => res.send('OK'));
// 정적 파일(선택)  /api/index/public/…
router.use('/public', express_1.default.static('public'));
// Swagger (선택)   /api/index/api-docs
const swaggerDoc = yamljs_1.default.load(path_1.default.join(__dirname, '..', 'docs', 'openapi.yaml'));
router.use('/api-docs', ...swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDoc));
/* **한 번만** 프리픽스 부여 */
exports.app.use('/api/index', router);
/* 404 / 500 핸들러 */
exports.app.use((_req, res) => res.status(404).json({ msg: 'not found' }));
exports.app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ msg: 'internal error' });
});
