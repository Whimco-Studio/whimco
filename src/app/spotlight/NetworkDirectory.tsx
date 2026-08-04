import NetworkStyles from './networkStyles';
import ShowcaseStyles from './styles';
import { NetworkData, NetworkServer } from './constants';

// Pinned first by the API's own sort too. Matched again here so the hero
// still renders correctly if that ever changes upstream.
const SPOTLIGHT_SUPPORT_SERVER_ID = '1430720916832256084';

/** A server's icon, or a monogram of its first character when it has
    none. `sizeClass` carries both the box dimensions and the border, so
    the same monogram styling works at card and hero scale. */
function ServerIcon({ server, sizeClass }: { server: NetworkServer; sizeClass: string }) {
  if (server.icon) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className={sizeClass} src={server.icon} alt="" referrerPolicy="no-referrer" />
    );
  }
  const initial = (Array.from(server.name)[0] ?? '?').toUpperCase();
  return (
    <span className={`${sizeClass} nt-monogram`} aria-hidden="true">
      {initial}
    </span>
  );
}

/** Blurred backdrop behind a card, tinted from the server's own icon.
    Empty for servers with no icon rather than faking a colour. */
function Wash({ server }: { server: NetworkServer }) {
  if (!server.icon) {
    return <div className="nt-wash nt-wash-empty" aria-hidden="true" />;
  }
  return (
    <div className="nt-wash" aria-hidden="true" style={{ backgroundImage: `url(${server.icon})` }} />
  );
}

function ServerCard({ server }: { server: NetworkServer }) {
  const { name, members, online } = server;
  return (
    <article className="nt-card">
      <Wash server={server} />
      <div className="nt-identity">
        <ServerIcon server={server} sizeClass="nt-icon" />
        <div className="nt-id">
          <h2 className="nt-name" title={name}>{name}</h2>
          <p className="nt-meta">
            <span className="nt-dot" aria-hidden="true" />
            {online.toLocaleString('en-US')} online
          </p>
        </div>
      </div>
      <div className="nt-body">
        <p className="nt-count"><b>{members.toLocaleString('en-US')}</b> members</p>
      </div>
    </article>
  );
}

/** Spotlight Support gets its own treatment, not just first place in the
    grid: at four members it would otherwise read as a rounding error
    sitting above a 139,780-member community. No join link here, none
    exists yet in either repo, but the markup leaves room for one without
    restructuring. */
function HeroCard({ server }: { server: NetworkServer }) {
  const { name, members, online } = server;
  return (
    <article className="nt-card nt-hero">
      <Wash server={server} />
      <ServerIcon server={server} sizeClass="nt-hero-icon" />
      <div className="nt-hero-text">
        <span className="nt-badge">SUPPORT SERVER</span>
        <h2 className="nt-hero-name">{name}</h2>
        <p className="nt-hero-copy">
          Questions, bug reports, and the people who curate the showcase.
        </p>
      </div>
      <p className="nt-hero-stat">
        <b>{members.toLocaleString('en-US')}</b> members
        <br />
        <span>{online.toLocaleString('en-US')} online</span>
      </p>
    </article>
  );
}

/** The network directory: the same broadcast the creators page shows,
    viewed from where it lands instead of who sends it. No pagination and
    no client state, unlike CreatorsGallery: 42 servers fit in one
    response and the list grows a handful of times a week, so this stays
    a Server Component. */
export default function NetworkDirectory({ data }: { data: NetworkData | null }) {
  const servers = data?.servers ?? [];
  const total = data?.total ?? 0;
  const members = data?.members ?? 0;
  const hero = servers.find((s) => s.id === SPOTLIGHT_SUPPORT_SERVER_ID);
  const rest = servers.filter((s) => s.id !== SPOTLIGHT_SUPPORT_SERVER_ID);

  return (
    <div className="showcase">
      <ShowcaseStyles />
      <NetworkStyles />

      <header className="nt-head">
        <a className="pf-back" href="/spotlight">← THE SHOWCASE</a>
        <h1 className="nt-title">THE NETWORK</h1>
        <p className="nt-sub">
          Every community Spotlight broadcasts into. Post once in any of
          them, and your work reaches all the rest.
        </p>
      </header>

      {total > 0 ? (
        <>
          <div className="nt-rail">
            <div className="nt-stat">
              <b>{total.toLocaleString('en-US')}</b>
              <span>SERVERS</span>
            </div>
            <div className="nt-stat">
              <b>{members.toLocaleString('en-US')}</b>
              <span>MEMBERS REACHED</span>
            </div>
          </div>

          <section className="nt-grid" aria-label="Servers Spotlight broadcasts into">
            {hero && <HeroCard server={hero} />}
            {rest.map((s) => <ServerCard key={s.id} server={s} />)}
          </section>
        </>
      ) : (
        <div className="nt-empty-wrap">
          <p className="empty">The directory is momentarily offline, check back shortly.</p>
        </div>
      )}
    </div>
  );
}
