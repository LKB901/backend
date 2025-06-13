"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
/* ── 라우터 모음 ───────────────────────────── */
const agent_routes_1 = __importDefault(require("./routes/agent.routes"));
const contract_routes_1 = __importDefault(require("./routes/contract.routes"));
const property_routes_1 = __importDefault(require("./routes/property.routes"));
const registry_routes_1 = __importDefault(require("./routes/registry.routes"));
const pass_routes_1 = __importDefault(require("./routes/pass.routes"));
exports.app = (0, express_1.default)();
/* ───────── 공통 미들웨어 ───────── */
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
/* ───────── Swagger UI ─────────── */
const swaggerDoc = yamljs_1.default.load(path_1.default.join(__dirname, '..', 'docs', 'openapi.yaml'));
/**
 * swaggerUi.serve 타입이 `RequestHandler` 인데,
 * `app.use(path, ...handlers)` 는 `RequestHandlerParams[]` 를 요구해
 * TS2769 가 뜨는 경우가 있습니다.
 * → 단일 배열로 캐스팅해서 한 번에 해결
 */
exports.app.use('/api-docs', ...swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDoc));
/* ───────── REST 라우트 ─────────── */
exports.app.use('/agents', agent_routes_1.default);
exports.app.use('/contracts', contract_routes_1.default);
exports.app.use('/properties', property_routes_1.default);
exports.app.use('/registry', registry_routes_1.default);
exports.app.use('/pass', pass_routes_1.default);
/* ───────── 정적 파일 ───────────── */
exports.app.use('/public', express_1.default.static('public')); // PDF 다운로드 등
/* ───────── 헬스 체크 ───────────── */
exports.app.get('/health', (_req, res) => res.send('OK'));
/* ───────── 404 핸들러 ──────────── */
exports.app.use((_req, res) => res.status(404).json({ msg: 'not found' }));
/* ───────── 에러 핸들러 ─────────── */
exports.app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ msg: 'internal error' });
});
