import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Annotations } from './canvas/Annotations';
import { Arrows } from './canvas/Arrows';
import { Board } from './canvas/Board';
import { CanvasEngine, type Viewport } from './canvas/engine';
import { EngineContext } from './canvas/EngineContext';
import { expandRect } from './canvas/geometry';
import { measureWorld, measureZone } from './canvas/measure';
import { FileChip, Presence } from './chrome/Header';
import { Minimap } from './chrome/Minimap';
import { FollowBanner, Toast, ViewOnlyBar } from './chrome/Notices';
import { RequestAccessDialog } from './chrome/RequestAccessDialog';
import { Toolbar } from './chrome/Toolbar';
import { portfolio } from './content/portfolio';
import type { ZoneId } from './content/types';
import { activityReducer, initialActivity } from './guide/activity';
import { runCollaborator } from './guide/collaborator';
import { GuideCursor } from './guide/GuideCursor';
import { Ink } from './guide/Ink';
import { useTour } from './guide/useTour';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { isNarrow, prefersReducedMotion } from './lib/media';
import { STORAGE_KEYS, storage } from './lib/storage';
import { Contact } from './zones/Contact';
import { Hackathons } from './zones/Hackathons';
import { Intro } from './zones/Intro';
import { Learning } from './zones/Learning';
import { Projects } from './zones/Projects';
import { Toolbox } from './zones/Toolbox';
import { Work } from './zones/Work';

/** Space the camera keeps clear for the header (top) and the toolbar (bottom). */
const viewport = (): Viewport => ({ width: innerWidth, height: innerHeight, top: 70, bottom: 84 });
const VIEW_ONLY_NOTICE_MS = 4500;

const { person } = portfolio;
const ownerFirstName = person.name.split(' ')[0] ?? person.name;

export function App() {
  const [reducedMotion] = useState(prefersReducedMotion);
  const [engine] = useState(() => new CanvasEngine(viewport(), !reducedMotion));
  const worldRef = useRef<HTMLDivElement>(null);
  const [theme, toggleTheme] = useTheme();
  const { toast, show: showToast } = useToast();

  const [activity, dispatch] = useReducer(activityReducer, portfolio.intro.status, initialActivity);
  const activityRef = useRef(activity);
  activityRef.current = activity;

  const [pageView, setPageView] = useState(false);
  const [guideVisible, setGuideVisible] = useState(false);
  const [collaborating, setCollaborating] = useState(false);
  const [following, setFollowing] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestedEmail, setRequestedEmail] = useState(() => storage.get(STORAGE_KEYS.requested));
  const [viewOnlyVisible, setViewOnlyVisible] = useState(false);
  const viewOnlyTimer = useRef<number>();

  useEffect(() => {
    const onResize = () => engine.setViewport(viewport());
    addEventListener('resize', onResize);
    return () => removeEventListener('resize', onResize);
  }, [engine]);

  useEffect(() => {
    document.documentElement.classList.toggle('page-view', pageView);
  }, [pageView]);

  useEffect(() => {
    document.documentElement.classList.toggle('following', following);
  }, [following]);

  // ---------- the live cursor ----------

  /** Start the cursor working on the board. Returns false if motion is reduced. */
  const startCollaborating = useCallback(() => {
    if (reducedMotion) return false;
    setGuideVisible(true);
    setCollaborating(true);
    return true;
  }, [reducedMotion]);

  /** After the greeting or tour, the cursor stays and keeps working (or hides if it can't). */
  const releaseGuide = useCallback(() => {
    if (!startCollaborating()) setGuideVisible(false);
  }, [startCollaborating]);

  const tour = useTour({ engine, worldRef, steps: portfolio.tour, onEnd: releaseGuide });

  const gate = useRef({ touring: false, pageView: false, bubble: false, following: false });
  gate.current = { touring: tour.touring, pageView, bubble: tour.bubble !== null, following };

  useEffect(() => {
    const world = worldRef.current;
    if (!collaborating || !world) return;
    let running = true;
    void runCollaborator(
      {
        engine,
        world,
        dispatch,
        activity: () => activityRef.current,
        statusLines: portfolio.statusLines,
        canAct: () => {
          const g = gate.current;
          return running && !g.touring && !g.pageView && !g.bubble && !engine.interacting;
        },
        isFollowed: () => gate.current.following,
      },
      () => running,
    );
    return () => {
      running = false;
    };
  }, [collaborating, engine]);

  const stopFollowing = useCallback(() => setFollowing(false), []);

  const startTour = useCallback(() => {
    if (pageView) return;
    setFollowing(false);
    setGuideVisible(true);
    dispatch({ type: 'reset-ui' });
    storage.set(STORAGE_KEYS.toured, '1');
    tour.start();
  }, [pageView, tour]);

  const greet = useCallback(() => {
    setGuideVisible(true);
    tour.say({
      text: portfolio.greeting,
      actions: [
        { label: 'Show me around', onClick: startTour, primary: true },
        {
          label: "I'll explore",
          onClick: () => {
            tour.say(null);
            releaseGuide();
          },
        },
      ],
    });
  }, [tour, startTour, releaseGuide]);

  // ---------- camera ----------

  const introFocus = useCallback(() => {
    const world = worldRef.current;
    if (!world) return null;
    const intro = measureZone(world, 'intro');
    return isNarrow() ? engine.fit(intro, 12, 1) : engine.fit(expandRect(intro, 260, 160), 20, 1);
  }, [engine]);

  const flyToZone = useCallback(
    (zone: ZoneId) => {
      stopFollowing();
      const world = worldRef.current;
      if (pageView) {
        world
          ?.querySelector(`[data-zone="${zone}"]`)
          ?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
        return;
      }
      if (world) void engine.flyTo(engine.fit(measureZone(world, zone)));
    },
    [engine, pageView, reducedMotion, stopFollowing],
  );

  const fitAll = useCallback(() => {
    stopFollowing();
    if (worldRef.current) void engine.flyTo(engine.fit(measureWorld(worldRef.current), 40));
  }, [engine, stopFollowing]);

  const zoom = useCallback(
    (factor: number) => {
      stopFollowing();
      engine.zoomBy(factor);
    },
    [engine, stopFollowing],
  );

  // ---------- page view ----------

  const changeView = useCallback(
    (toPage: boolean, remember = true) => {
      setPageView(toPage);
      if (remember) storage.set(STORAGE_KEYS.view, toPage ? 'page' : 'canvas');
      if (toPage) {
        tour.stop();
        setFollowing(false);
        releaseGuide();
        scrollTo(0, 0);
      }
    },
    [tour, releaseGuide],
  );

  // when coming back from page view, frame the intro once the canvas layout is restored
  const leftPageView = useRef(false);
  useEffect(() => {
    if (pageView) {
      leftPageView.current = true;
      return;
    }
    if (!leftPageView.current) return;
    leftPageView.current = false;
    const focus = introFocus();
    if (focus) void engine.flyTo(focus, 0);
  }, [pageView, engine, introFocus]);

  // ---------- follow ----------

  const startFollowing = useCallback(() => {
    if (reducedMotion) {
      showToast(`${ownerFirstName} is idle right now`);
      return;
    }
    if (pageView) changeView(false);
    tour.stop();
    setFollowing(true);
    startCollaborating();
    void engine.flyTo(
      { cx: engine.guide.x, cy: engine.guide.y, z: Math.max(engine.camera.z, isNarrow() ? 0.6 : 0.85) },
      800,
    );
  }, [reducedMotion, pageView, changeView, tour, startCollaborating, engine, showToast]);

  // ---------- view-only and edit requests ----------

  const showViewOnly = useCallback(() => {
    setViewOnlyVisible(true);
    clearTimeout(viewOnlyTimer.current);
    viewOnlyTimer.current = window.setTimeout(() => setViewOnlyVisible(false), VIEW_ONLY_NOTICE_MS);
  }, []);

  const refuseDrag = useCallback(
    (item: HTMLElement) => {
      item.classList.remove('shake');
      void item.offsetWidth; // restart the animation
      item.classList.add('shake');
      setTimeout(() => item.classList.remove('shake'), 450);
      showViewOnly();
    },
    [showViewOnly],
  );

  const openRequest = useCallback(() => {
    setViewOnlyVisible(false);
    setRequestOpen(true);
  }, []);

  const closeRequest = useCallback(() => setRequestOpen(false), []);

  const onRequested = useCallback((email: string) => {
    storage.set(STORAGE_KEYS.requested, email);
    setRequestedEmail(email);
    const who = (email.split('@')[0] ?? email)
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    // the owner's cursor notices the request
    setTimeout(() => {
      if (gate.current.pageView || gate.current.touring) return;
      setGuideVisible(true);
      dispatch({ type: 'chat', text: `📬 New edit request from ${who}! I'll take a look.` });
      setTimeout(() => dispatch({ type: 'chat', text: null }), 4000);
    }, 900);
  }, []);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(person.email);
      showToast('Email copied');
    } catch {
      location.href = `mailto:${person.email}`;
    }
  }, [showToast]);

  // ---------- first load ----------

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      const saved = storage.get(STORAGE_KEYS.view);
      // phones read better as a page; the canvas is one tap away
      if (saved === 'page' || (!saved && isNarrow())) {
        changeView(true, false);
        return;
      }
      const world = worldRef.current;
      if (!world) return;
      engine.setFocus(engine.fit(measureWorld(world), 40));
      timers.push(
        window.setTimeout(async () => {
          const focus = introFocus();
          if (!focus || cancelled) return;
          await engine.flyTo(focus, 1400);
          if (cancelled) return;
          if (storage.get(STORAGE_KEYS.toured)) startCollaborating();
          else timers.push(window.setTimeout(greet, 300));
        }, 500),
      );
    });
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // runs once on mount; later changes to these callbacks don't restart the intro
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <EngineContext.Provider value={engine}>
      <Board
        worldRef={worldRef}
        pageView={pageView}
        shortcutsEnabled={!requestOpen}
        onNavigate={stopFollowing}
        onLockedDrag={refuseDrag}
        onEditShortcut={showViewOnly}
      >
        <Arrows arrows={portfolio.arrows} />
        <Ink strokes={activity.ink} selection={activity.selection} name={ownerFirstName} />
        <Intro
          intro={portfolio.intro}
          startHere={portfolio.startHere}
          status={activity.status}
          typing={activity.typing}
          resumeUrl={person.resumeUrl}
          onSeeWork={() => flyToZone('projects')}
        />
        <Work
          label={portfolio.labels.work}
          experience={portfolio.experience}
          highlight={portfolio.highlight}
          highlightOffset={activity.nudges[portfolio.highlight.id]}
          highlightCarried={activity.carrying === portfolio.highlight.id}
        />
        <Projects label={portfolio.labels.projects} projects={portfolio.projects} />
        <Hackathons
          label={portfolio.labels.wins}
          wins={portfolio.wins}
          offsets={activity.nudges}
          carried={activity.carrying}
        />
        <Toolbox label={portfolio.labels.stack} cards={portfolio.skills} />
        <Learning
          label={portfolio.labels.learning}
          education={portfolio.education}
          certifications={portfolio.certifications}
        />
        <Contact
          label={portfolio.labels.contact}
          contact={portfolio.contact}
          person={person}
          onCopyEmail={copyEmail}
        />
        <Annotations notes={portfolio.annotations} />
      </Board>

      <FileChip name={person.name} />
      <Presence
        person={person}
        ownerActive={activity.doing !== ''}
        following={following}
        requested={requestedEmail !== null}
        onToggleFollow={following ? stopFollowing : startFollowing}
        onRequestAccess={openRequest}
      />
      <Toolbar
        pageView={pageView}
        touring={tour.touring}
        onZone={flyToZone}
        onZoom={zoom}
        onFit={fitAll}
        onToggleTour={tour.touring ? tour.end : startTour}
        onTogglePageView={() => changeView(!pageView)}
        onToggleTheme={toggleTheme}
      />
      <Minimap worldRef={worldRef} theme={theme} />
      <div className="hint">drag to pan · ctrl + scroll to zoom</div>

      <GuideCursor
        name={ownerFirstName}
        visible={guideVisible && !pageView}
        doing={activity.doing}
        chat={activity.chat}
        bubble={tour.bubble}
      />
      <Toast {...toast} />
      <ViewOnlyBar
        visible={viewOnlyVisible}
        requested={requestedEmail !== null}
        onRequestAccess={openRequest}
      />
      <FollowBanner name={ownerFirstName} following={following} onStop={stopFollowing} />
      <RequestAccessDialog
        open={requestOpen}
        person={person}
        requestedEmail={requestedEmail}
        onClose={closeRequest}
        onRequested={onRequested}
      />
    </EngineContext.Provider>
  );
}
