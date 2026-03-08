/**
 * Mascoteach Adventure Game — Kaplay.js engine
 *
 * A side-scrolling platformer where students answer questions
 * (displayed as React overlays) to clear glowing blocks and progress.
 *
 * Usage:
 *   const game = createAdventureGame(canvasElement, questions, callbacks);
 *   game.resumeAfterAnswer(isCorrect);   // call from React after student answers
 *   game.destroy();                       // cleanup on unmount
 */
import kaplay from 'kaplay';

// ── Layout constants ──────────────────────────────────────────────────────────
const W = 800;
const H = 400;
const GROUND_Y = 315;
const GRAVITY = 1500;
const JUMP_FORCE = 620;
const RUN_SPEED = 170;

// Player sprite dimensions
const PW = 44;
const PH = 44;

// Question block dimensions
const BW = 48;
const BH = 48;

// World spacing between question blocks (pixels)
const BLOCK_SPACING = 580;

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object[]} questions  Normalized questions (from gameService.normalizeQuestion)
 * @param {object} callbacks
 * @param {(index: number) => void} callbacks.onQuestionTrigger
 * @param {() => void} callbacks.onGameComplete
 * @returns {{ resumeAfterAnswer(isCorrect: boolean): void, destroy(): void }}
 */
export function createAdventureGame(canvas, questions, { onQuestionTrigger, onGameComplete }) {
    let k = null;

    // Shared mutable state (accessed inside Kaplay scene closures)
    const state = {
        isPaused: false,
        isEnded: false,
        pendingBlock: null,   // block waiting to be destroyed after answer
        spawnedCount: 0,      // how many blocks have been spawned
        clearedCount: 0,      // how many blocks have been cleared
        nextBlockWorldX: 640, // world-x of next block to spawn
        finishSpawned: false,
    };

    k = kaplay({
        canvas,
        width: W,
        height: H,
        letterbox: true,
        background: [10, 18, 48],
        debug: false,
        global: false,          // do NOT pollute window
        maxFPS: 60,
    });

    // ── Scene ─────────────────────────────────────────────────────────────────
    k.scene('adventure', () => {
        k.setGravity(GRAVITY);

        // ── Sky ──────────────────────────────────────────────────────────────
        k.add([
            k.rect(W, H),
            k.color(10, 18, 48),
            k.pos(0, 0),
            k.fixed(),
            k.z(-20),
        ]);

        // Stars (fixed on screen)
        for (let i = 0; i < 55; i++) {
            k.add([
                k.circle(Math.random() * 1.4 + 0.4),
                k.color(255, 255, 255),
                k.opacity(Math.random() * 0.7 + 0.2),
                k.pos(Math.random() * W, Math.random() * 240),
                k.fixed(),
                k.z(-18),
            ]);
        }

        // Moon
        k.add([
            k.circle(26),
            k.color(245, 238, 195),
            k.opacity(0.92),
            k.pos(710, 58),
            k.fixed(),
            k.z(-17),
        ]);
        // Moon glow
        k.add([
            k.circle(36),
            k.color(245, 238, 195),
            k.opacity(0.12),
            k.pos(710, 58),
            k.fixed(),
            k.z(-18),
        ]);

        // ── Distant hills (parallax layer, fixed) ────────────────────────────
        const farHills = [];
        for (let i = 0; i < 7; i++) {
            farHills.push({
                obj: k.add([
                    k.circle(90 + i * 18),
                    k.color(28, 45, 90),
                    k.pos(i * 160 - 40, 270),
                    k.fixed(),
                    k.z(-12),
                ]),
                baseX: i * 160 - 40,
            });
        }
        // Near hills
        const nearHills = [];
        for (let i = 0; i < 6; i++) {
            nearHills.push({
                obj: k.add([
                    k.circle(65 + i * 12),
                    k.color(22, 74, 40),
                    k.pos(i * 190 - 30, 295),
                    k.fixed(),
                    k.z(-8),
                ]),
                baseX: i * 190 - 30,
            });
        }

        // ── Ground ───────────────────────────────────────────────────────────
        // Very wide static ground
        k.add([
            k.rect(120000, 100),
            k.color(34, 85, 34),
            k.pos(-500, GROUND_Y),
            k.area(),
            k.body({ isStatic: true }),
            k.z(1),
        ]);
        // Brighter grass strip on top
        k.add([
            k.rect(120000, 10),
            k.color(58, 140, 58),
            k.pos(-500, GROUND_Y),
            k.z(2),
        ]);

        // ── World decorations ─────────────────────────────────────────────────
        // Trees spread across the world
        for (let i = 0; i < 60; i++) {
            const wx = i * 290 + Math.random() * 80 - 40;
            const h = 35 + Math.random() * 20;
            // Trunk
            k.add([k.rect(12, h), k.color(110, 65, 20), k.pos(wx, GROUND_Y - h), k.z(2)]);
            // Crown
            const cr = 20 + Math.random() * 10;
            k.add([k.circle(cr), k.color(28, 105, 40), k.pos(wx + 6, GROUND_Y - h - cr * 0.6), k.z(3)]);
        }

        // Rocks
        for (let i = 0; i < 20; i++) {
            const wx = i * 700 + 200 + Math.random() * 100;
            k.add([k.rect(24, 16, { radius: 4 }), k.color(80, 80, 90), k.pos(wx, GROUND_Y - 14), k.z(2)]);
        }

        // ── Clouds (parallax, fixed layer) ────────────────────────────────────
        const clouds = [];
        for (let i = 0; i < 7; i++) {
            clouds.push({
                obj: k.add([
                    k.rect(70 + Math.random() * 55, 28, { radius: 14 }),
                    k.color(200, 215, 245),
                    k.opacity(0.45),
                    k.pos(i * 165 + Math.random() * 60, 48 + Math.random() * 90),
                    k.fixed(),
                    k.z(-6),
                ]),
                baseX: i * 165 + Math.random() * 60,
            });
        }

        // ── Player (Tanuki raccoon) ────────────────────────────────────────────
        const player = k.add([
            k.rect(PW, PH, { radius: 10 }),
            k.color(210, 128, 48),
            k.pos(100, GROUND_Y - PH),
            k.area({ shape: new k.Rect(k.vec2(0), PW, PH) }),
            k.body(),
            k.z(10),
            'player',
        ]);

        // Raccoon face drawn on player each frame
        player.onDraw(() => {
            // Raccoon ears
            k.drawRect({ pos: k.vec2(-4, -7), width: 13, height: 11, radius: 5, color: k.rgb(160, 85, 28) });
            k.drawRect({ pos: k.vec2(PW - 9, -7), width: 13, height: 11, radius: 5, color: k.rgb(160, 85, 28) });
            // Eye whites
            k.drawCircle({ pos: k.vec2(12, 14), radius: 6, color: k.rgb(255, 255, 255) });
            k.drawCircle({ pos: k.vec2(PW - 12, 14), radius: 6, color: k.rgb(255, 255, 255) });
            // Pupils
            k.drawCircle({ pos: k.vec2(13, 15), radius: 3.5, color: k.rgb(30, 20, 0) });
            k.drawCircle({ pos: k.vec2(PW - 11, 15), radius: 3.5, color: k.rgb(30, 20, 0) });
            // Eye shine
            k.drawCircle({ pos: k.vec2(14, 13), radius: 1.2, color: k.rgb(255, 255, 255) });
            k.drawCircle({ pos: k.vec2(PW - 10, 13), radius: 1.2, color: k.rgb(255, 255, 255) });
            // Nose
            k.drawCircle({ pos: k.vec2(PW / 2, 24), radius: 4, color: k.rgb(90, 44, 12) });
            // Cheeks
            k.drawCircle({ pos: k.vec2(7, 27), radius: 5, color: k.rgba(255, 150, 150, 0.45) });
            k.drawCircle({ pos: k.vec2(PW - 7, 27), radius: 5, color: k.rgba(255, 150, 150, 0.45) });
            // Raccoon mask
            k.drawRect({ pos: k.vec2(5, 9), width: 15, height: 9, radius: 4, color: k.rgba(40, 20, 0, 0.35) });
            k.drawRect({ pos: k.vec2(PW - 20, 9), width: 15, height: 9, radius: 4, color: k.rgba(40, 20, 0, 0.35) });
            // Tail stripe (visible at bottom)
            k.drawRect({ pos: k.vec2(PW / 2 - 5, PH - 6), width: 10, height: 6, radius: 3, color: k.rgb(255, 230, 160) });
        });

        // ── Jump controls ─────────────────────────────────────────────────────
        k.onKeyPress('space', () => {
            if (!state.isPaused && !state.isEnded && player.isGrounded()) {
                player.jump(JUMP_FORCE);
            }
        });
        k.onKeyPress('up', () => {
            if (!state.isPaused && !state.isEnded && player.isGrounded()) {
                player.jump(JUMP_FORCE);
            }
        });
        k.onTouchStart(() => {
            if (!state.isPaused && !state.isEnded && player.isGrounded()) {
                player.jump(JUMP_FORCE);
            }
        });

        // ── HUD — progress bar (bottom of canvas) ────────────────────────────
        k.add([k.rect(W, 8), k.color(30, 30, 60), k.pos(0, H - 18), k.fixed(), k.z(15)]);
        const progressFill = k.add([
            k.rect(0, 8),
            k.color(91, 174, 212),
            k.pos(0, H - 18),
            k.fixed(),
            k.z(16),
        ]);
        // Finish icon on progress bar
        k.add([k.text('🏁', { size: 14 }), k.pos(W - 18, H - 22), k.fixed(), k.z(17)]);

        // ── Main update ───────────────────────────────────────────────────────
        let lastCamX = W / 2;

        k.onUpdate(() => {
            if (state.isPaused || state.isEnded) return;

            // Auto-run
            player.pos.x += RUN_SPEED * k.dt();

            // Camera: keep player at ~1/3 from left
            const targetCamX = player.pos.x + W * 0.1;
            k.camPos(targetCamX, H / 2);

            // Parallax clouds (fixed layer, drift slowly)
            const camDelta = targetCamX - lastCamX;
            lastCamX = targetCamX;

            clouds.forEach((c) => {
                c.obj.pos.x -= camDelta * 0.18;
                if (c.obj.pos.x < -120) c.obj.pos.x = W + 80;
                if (c.obj.pos.x > W + 80) c.obj.pos.x = -120;
            });

            // Parallax hills
            farHills.forEach((h, i) => {
                h.obj.pos.x = h.baseX - (player.pos.x - 100) * 0.08;
            });
            nearHills.forEach((h, i) => {
                h.obj.pos.x = h.baseX - (player.pos.x - 100) * 0.22;
            });

            // Spawn next question block if player is close enough
            if (
                state.spawnedCount < questions.length &&
                player.pos.x + 500 >= state.nextBlockWorldX
            ) {
                spawnQuestionBlock(state.nextBlockWorldX, state.spawnedCount);
                state.nextBlockWorldX += BLOCK_SPACING;
                state.spawnedCount++;
            }

            // Spawn finish flag after last block
            if (state.spawnedCount >= questions.length && !state.finishSpawned) {
                state.finishSpawned = true;
                spawnFinishLine(state.nextBlockWorldX + 320);
            }

            // Progress fill
            const totalWorld = state.nextBlockWorldX + 200;
            const progress = Math.min((player.pos.x - 100) / (totalWorld - 200), 1);
            progressFill.width = W * progress;
        });

        // ── Question block ─────────────────────────────────────────────────────
        function spawnQuestionBlock(worldX, questionIdx) {
            let t = 0;
            const block = k.add([
                k.rect(BW, BH, { radius: 10 }),
                k.color(255, 210, 0),
                k.pos(worldX, GROUND_Y - BH),
                k.area({ shape: new k.Rect(k.vec2(0), BW, BH) }),
                k.z(8),
                'obstacle',
                { questionIndex: questionIdx },
            ]);

            // Animated glow + "?" label
            block.onDraw(() => {
                const glow = 0.25 + Math.sin(t * 3) * 0.12;
                k.drawRect({
                    pos: k.vec2(-6, -6),
                    width: BW + 12,
                    height: BH + 12,
                    radius: 15,
                    color: k.rgba(255, 200, 0, glow),
                });
                k.drawText({
                    text: '?',
                    size: 28,
                    pos: k.vec2(10, 8),
                    color: k.rgb(80, 40, 0),
                    font: 'monospace',
                });
            });

            // Hover float
            const baseY = GROUND_Y - BH;
            block.onUpdate(() => {
                t += k.dt();
                block.pos.y = baseY + Math.sin(t * 2.5) * 5;
            });
        }

        // ── Finish flag ────────────────────────────────────────────────────────
        function spawnFinishLine(worldX) {
            // Flag pole
            k.add([k.rect(6, 110), k.color(200, 200, 200), k.pos(worldX, GROUND_Y - 110), k.z(5)]);
            // Flag banner
            k.add([k.rect(44, 30, { radius: 4 }), k.color(255, 75, 75), k.pos(worldX + 6, GROUND_Y - 110), k.z(6)]);
            k.add([k.text('FINISH', { size: 9 }), k.color(255, 255, 255), k.pos(worldX + 9, GROUND_Y - 105), k.z(7)]);

            // Invisible wide trigger area
            const trigger = k.add([
                k.rect(60, 110),
                k.color(0, 0, 0),
                k.opacity(0),
                k.pos(worldX - 10, GROUND_Y - 110),
                k.area(),
                k.z(5),
                'finish',
            ]);

            player.onCollide('finish', () => {
                if (!state.isEnded) {
                    state.isEnded = true;
                    // Small delay so player visually reaches the flag
                    setTimeout(() => onGameComplete(), 600);
                }
            });
        }

        // ── Collision: player hits question block ─────────────────────────────
        player.onCollide('obstacle', (block) => {
            if (state.isPaused || state.isEnded) return;
            state.isPaused = true;
            state.pendingBlock = block;
            onQuestionTrigger(block.questionIndex);
        });
    });

    k.go('adventure');

    // ── Public API ────────────────────────────────────────────────────────────
    return {
        /**
         * Called by React after the student answers the question popup.
         * @param {boolean} isCorrect
         */
        resumeAfterAnswer(isCorrect) {
            if (!k) return;

            // Destroy the pending question block
            if (state.pendingBlock) {
                const bx = state.pendingBlock.pos.x + BW / 2;
                const by = state.pendingBlock.pos.y + BH / 2;
                spawnParticles(k, bx, by, isCorrect);
                state.pendingBlock.destroy();
                state.pendingBlock = null;
                state.clearedCount++;
            }

            state.isPaused = false;
        },

        /** Cleanup: called on React component unmount */
        destroy() {
            try {
                if (k) {
                    k.quit();
                    k = null;
                }
            } catch (_) { /* ignore */ }
        },
    };
}

// ── Particle burst helper ─────────────────────────────────────────────────────
function spawnParticles(k, x, y, isCorrect) {
    const baseColor = isCorrect ? [80, 230, 110] : [220, 70, 70];
    const count = isCorrect ? 14 : 9;

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = 90 + Math.random() * 110;

        const p = k.add([
            k.circle(3 + Math.random() * 4),
            k.color(...baseColor),
            k.opacity(1),
            k.pos(x, y),
            k.z(25),
            {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 70,
                life: 0.55 + Math.random() * 0.45,
                age: 0,
            },
        ]);

        p.onUpdate(() => {
            p.pos.x += p.vx * k.dt();
            p.pos.y += p.vy * k.dt();
            p.vy += 280 * k.dt(); // gravity
            p.age += k.dt();
            p.opacity = Math.max(0, 1 - p.age / p.life);
            if (p.age >= p.life) p.destroy();
        });
    }

    // Extra star burst for correct answer
    if (isCorrect) {
        for (let i = 0; i < 5; i++) {
            const starP = k.add([
                k.text('⭐', { size: 14 }),
                k.pos(x + (Math.random() - 0.5) * 40, y - 10),
                k.opacity(1),
                k.z(26),
                {
                    vy: -(60 + Math.random() * 60),
                    life: 0.8,
                    age: 0,
                },
            ]);
            starP.onUpdate(() => {
                starP.pos.y += starP.vy * k.dt();
                starP.vy += 100 * k.dt();
                starP.age += k.dt();
                starP.opacity = Math.max(0, 1 - starP.age / starP.life);
                if (starP.age >= starP.life) starP.destroy();
            });
        }
    }
}
