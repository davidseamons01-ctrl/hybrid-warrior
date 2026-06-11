// Social / Community tab — first screen of the strangler UI rebuild.
// Pure presentation: receives data + action callbacks as props, renders with
// Preact JSX (which AUTO-ESCAPES all interpolated text — closing the XSS hole
// the old string-template version had with ad-hoc `.replace('<','&lt;')`).
import { render } from "preact";
import { useState } from "preact/hooks";

export interface LeaderRow {
  uid: string;
  handle: string;
  level: number;
  sex: string;
  me: boolean;
  rank: number;
  display: string;
}
export interface FeedPost {
  id: string;
  uid: string;
  handle: string;
  text: string;
  ago: string;
  liked: boolean;
  own: boolean;
  hearts: number;
}
export interface SocialStats {
  level: number;
  streak: number;
  bench1RM: number;
  squat1RM: number;
  deadlift1RM: number;
  monthMiles: number;
}
export interface SocialActions {
  join: (handle: string) => void;
  editHandle: () => void;
  pushStats: () => void;
  leave: () => void;
  setLeaderTab: (id: string) => void;
  post: (text: string) => void;
  heart: (id: string) => void;
  del: (id: string) => void;
}
export interface SocialProps {
  mode: "signed-out" | "offline" | "active";
  totalAthletes: number;
  optedIn: boolean;
  handle: string;
  myStats: SocialStats;
  leaderTab: string;
  leaderRows: LeaderRow[];
  posts: FeedPost[];
  actions: SocialActions;
}

const LB_TABS: ReadonlyArray<readonly [string, string]> = [
  ["hybrid", "Hybrid Total"],
  ["bench", "Bench 1RM"],
  ["squat", "Squat 1RM"],
  ["deadlift", "Deadlift 1RM"],
  ["volume", "Month Volume"],
  ["miles", "Month Miles"],
  ["level", "Warrior Level"],
  ["streak", "Current Streak"],
];

function rankMedal(rank: number): string {
  return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : String(rank);
}

function MeCard({ handle, stats, actions }: { handle: string; stats: SocialStats; actions: SocialActions }) {
  const cell = (val: number | string, lab: string) => (
    <div>
      <div class="cm-val">{val || "—"}</div>
      <div class="cm-lab">{lab}</div>
    </div>
  );
  return (
    <div class="card section community-me-card">
      <div class="community-me-head">
        <div>
          <div class="community-me-handle">{handle}</div>
          <div class="community-me-tag">
            Lv {stats.level} · {stats.streak}d streak
          </div>
        </div>
        <button type="button" class="btn btn-sm btn-ghost" onClick={() => actions.editHandle()}>
          Edit handle
        </button>
      </div>
      <div class="community-me-stats">
        {cell(stats.bench1RM, "Bench 1RM")}
        {cell(stats.squat1RM, "Squat 1RM")}
        {cell(stats.deadlift1RM, "Deadlift 1RM")}
        {cell(stats.monthMiles || 0, "Mo Miles")}
      </div>
      <div class="community-me-actions">
        <button type="button" class="btn btn-sm btn-secondary-solid" onClick={() => actions.pushStats()}>
          ↻ Push my stats
        </button>
        <button type="button" class="btn btn-sm btn-ghost" onClick={() => actions.leave()}>
          Leave community
        </button>
      </div>
    </div>
  );
}

function JoinCard({ actions }: { actions: SocialActions }) {
  const [val, setVal] = useState("");
  return (
    <div class="card section community-join-card">
      <div class="community-join-icon">🤝</div>
      <h3 class="community-join-title">Join the Hybrid Community</h3>
      <p class="community-join-desc">
        Pick a handle and share your training stats anonymously. Compare on leaderboards, motivate other athletes, and
        earn community recognition.
      </p>
      <div class="community-join-form">
        <input
          type="text"
          class="input-sm"
          placeholder="Your handle (e.g. SteelMike)"
          maxlength={24}
          autocomplete="off"
          value={val}
          onInput={(e) => setVal((e.target as HTMLInputElement).value)}
        />
        <button type="button" class="btn btn-cta btn-block" onClick={() => actions.join(val)}>
          Join community
        </button>
      </div>
      <div class="community-privacy-note">
        Your handle and stats become visible to other users. Your email, real name, body weight, and notes stay private.
      </div>
    </div>
  );
}

function Leaderboards({ tab, rows, actions }: { tab: string; rows: LeaderRow[]; actions: SocialActions }) {
  return (
    <div class="card section social-leaderboard-card">
      <div class="card-h">
        <h2>🏆 Live Leaderboards</h2>
      </div>
      <div class="lb-tabs">
        {LB_TABS.map(([id, label]) => (
          <button type="button" class={"lb-tab" + (tab === id ? " on" : "")} onClick={() => actions.setLeaderTab(id)}>
            {label}
          </button>
        ))}
      </div>
      <div class="lb-rows">
        {rows.length === 0 ? (
          <div class="social-empty">No community data yet — be the first to share your stats!</div>
        ) : (
          rows.map((r) => (
            <div class={"lb-row" + (r.me ? " lb-me" : "")}>
              <span class="lb-rank">{rankMedal(r.rank)}</span>
              <span class="lb-handle">
                {r.handle}
                {r.me ? <span class="lb-me-tag"> you</span> : null}
              </span>
              <span class="lb-meta">
                Lv {r.level}
                {r.sex === "female" ? " · ♀" : r.sex === "male" ? " · ♂" : ""}
              </span>
              <span class="lb-val">{r.display}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MotivationWall({ optedIn, posts, actions }: { optedIn: boolean; posts: FeedPost[]; actions: SocialActions }) {
  const [text, setText] = useState("");
  const submit = () => {
    actions.post(text);
    setText("");
  };
  return (
    <div class="card section social-feed-card">
      <div class="card-h">
        <h2>💬 Motivation Wall</h2>
      </div>
      {optedIn ? (
        <div class="feed-composer">
          <textarea
            maxlength={280}
            rows={2}
            placeholder="Drop motivation, share a PR, or hype the squad…"
            value={text}
            onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
          />
          <div class="feed-composer-row">
            <span class="feed-charcount">{text.length}/280</span>
            <button type="button" class="btn btn-sm btn-cta" onClick={submit}>
              Post
            </button>
          </div>
        </div>
      ) : (
        <div class="feed-locked">Join the community above to post &amp; react.</div>
      )}
      <div class="feed-list">
        {posts.length === 0 ? (
          <div class="social-empty">No motivation messages yet — drop the first one!</div>
        ) : (
          posts.map((p) => (
            <div class="feed-post">
              <div class="feed-post-head">
                <span class="feed-handle">{p.handle}</span>
                <span class="feed-ago">{p.ago}</span>
                {p.own ? (
                  <button type="button" class="feed-del" title="Delete" onClick={() => actions.del(p.id)}>
                    ×
                  </button>
                ) : null}
              </div>
              {/* JSX renders text content escaped; newlines preserved via CSS white-space on .feed-body */}
              <div class="feed-body" style="white-space:pre-wrap">
                {p.text}
              </div>
              <div class="feed-foot">
                <button
                  type="button"
                  class={"feed-heart" + (p.liked ? " liked" : "")}
                  aria-label="React"
                  onClick={() => actions.heart(p.id)}
                >
                  {p.liked ? "❤️" : "🤍"} {p.hearts}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function SocialView(p: SocialProps) {
  if (p.mode === "signed-out") {
    return (
      <div class="social-shell">
        <div class="social-header">
          <h1 class="social-title">Community</h1>
          <p class="social-subtitle">Sign in to connect with other hybrid athletes.</p>
        </div>
      </div>
    );
  }
  if (p.mode === "offline") {
    return (
      <div class="social-shell">
        <div class="social-header">
          <h1 class="social-title">Community</h1>
          <p class="social-subtitle">Community features need an internet connection.</p>
        </div>
        <div class="card section" style="text-align:center;padding:24px">
          <div style="font-size:28px;margin-bottom:8px">📡</div>
          <p style="font-size:13px;color:var(--text2)">
            You're working offline. Sign in with cloud sync to access the global community.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div class="social-shell">
      <div class="social-header">
        <h1 class="social-title">Community</h1>
        <p class="social-subtitle">
          Global hybrid athletes training together.{" "}
          {p.totalAthletes > 0 ? (
            <>
              <b>{p.totalAthletes}</b> athletes connected.
            </>
          ) : (
            "Be the first to join."
          )}
        </p>
      </div>
      {p.optedIn ? <MeCard handle={p.handle} stats={p.myStats} actions={p.actions} /> : <JoinCard actions={p.actions} />}
      <Leaderboards tab={p.leaderTab} rows={p.leaderRows} actions={p.actions} />
      <MotivationWall optedIn={p.optedIn} posts={p.posts} actions={p.actions} />
      <div class="card section social-challenge-card community-info-card">
        <div class="social-challenge-badge">🏅</div>
        <div class="social-challenge-info">
          <div class="social-challenge-name">How leaderboards work</div>
          <div class="social-challenge-desc">
            Your best 1RM estimates and monthly running miles are updated automatically when you log workouts. Hit "Push
            my stats" to force-refresh. Hearts on motivation posts count as community recognition.
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mount/refresh the Social tab into a container (called from ui.js). */
export function mountSocial(container: Element, props: SocialProps): void {
  render(<SocialView {...props} />, container as unknown as import("preact").ContainerNode);
}
