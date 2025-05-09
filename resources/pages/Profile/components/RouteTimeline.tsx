import classNames from 'classnames';

export interface RouteTimelineProps {
  className?: string;
}

export const RouteTimeline = ({
  className,
}: RouteTimelineProps): JSX.Element => (
  <ul className={classNames('timeline h-[90px] flex-1', className)}>
    <li>
      <div className="timeline-start timeline-box m-0 border-none bg-transparent font-mono">
        PDX
      </div>
      <div className="timeline-middle">
        <div className="bg-error h-4 w-4 rounded-full" />
      </div>
      <div className="timeline-end flex flex-col font-mono text-xs opacity-60">
        <div className="mr-2 text-xs line-through">7:30am</div>
        <div className={classNames('text-xs font-bold', 'text-warning')}>
          8:11am
        </div>
      </div>
      <hr className="bg-error rounded-none" />
    </li>
    <li className="flex-1">
      <hr className="bg-error rounded-none" />
      <div className="timeline-middle" />
      <div className="timeline-end timeline-box border-none bg-transparent text-xs whitespace-nowrap opacity-60">
        5h 30m
      </div>
      <hr className="bg-error rounded-none" />
    </li>
    <li>
      <hr className="bg-error rounded-none" />
      <div className="timeline-start timeline-box m-0 border-none bg-transparent font-mono">
        HNL
      </div>
      <div className="timeline-middle">
        <div className="bg-error h-4 w-4 rounded-full" />
      </div>
      <div className="timeline-end flex flex-col font-mono text-xs opacity-60">
        <div className="mr-2 text-xs line-through">11:35am</div>
        <div className={classNames('text-xs font-bold', 'text-error')}>
          12:32pm
        </div>
      </div>
      <hr className="rounded-none bg-transparent" />
    </li>
    <li>
      <hr className="rounded-none bg-transparent" />
      <div className="timeline-middle text-xs whitespace-nowrap opacity-60">
        2h 14m
      </div>
      <hr className="rounded-none bg-transparent" />
    </li>
    <li>
      <hr className="rounded-none bg-transparent" />
      <div className="timeline-start timeline-box m-0 border-none bg-transparent font-mono">
        HNL
      </div>
      <div className="timeline-middle">
        <div className="bg-base-300 h-4 w-4 rounded-full" />
      </div>
      <div className="timeline-end flex flex-col font-mono text-xs opacity-60">
        <div className={classNames('text-xs font-bold', 'text-success')}>
          2:46pm
        </div>
      </div>
      <hr className="bg-base-300 rounded-none" />
    </li>
    <li className="flex-1">
      <hr className="bg-base-300 rounded-none" />
      <div className="timeline-middle" />
      <div className="timeline-end timeline-box border-none bg-transparent text-xs whitespace-nowrap opacity-60">
        50m
      </div>
      <hr className="rounded-none" />
    </li>
    <li>
      <hr className="bg-base-300 rounded-none" />
      <div className="timeline-start timeline-box m-0 border-none bg-transparent font-mono">
        OGG
      </div>
      <div className="timeline-middle">
        <div className="bg-base-300 h-4 w-4 rounded-full" />
      </div>
      <div className="timeline-end flex flex-col font-mono text-xs opacity-60">
        <div className={classNames('text-xs font-bold', 'text-success')}>
          3:36pm
        </div>
      </div>
      <hr className="rounded-none bg-transparent" />
    </li>
    <li>
      <hr className="rounded-none bg-transparent" />
      <div className="timeline-middle" />
      <div className="timeline-middle text-xs whitespace-nowrap opacity-60">
        6h 44m
      </div>
      <hr className="rounded-none bg-transparent" />
    </li>
    <li>
      <hr className="rounded-none bg-transparent" />
      <div className="timeline-start timeline-box m-0 border-none bg-transparent font-mono">
        OGG
      </div>
      <div className="timeline-middle">
        <div className="bg-base-300 h-4 w-4 rounded-full" />
      </div>
      <div className="timeline-end flex flex-col font-mono text-xs opacity-60">
        <div className={classNames('text-xs font-bold', 'text-success')}>
          10:20pm
        </div>
      </div>
      <hr className="bg-base-300 rounded-none" />
    </li>
    <li className="flex-1">
      <hr className="bg-base-300 rounded-none" />
      <div className="timeline-middle" />
      <div className="timeline-end timeline-box border-none bg-transparent text-xs whitespace-nowrap opacity-60">
        5h 41m
      </div>
      <hr className="bg-base-300 rounded-none" />
    </li>
    <li>
      <hr className="bg-base-300 rounded-none" />
      <div className="timeline-start timeline-box m-0 border-none bg-transparent font-mono">
        PHX
      </div>
      <div className="timeline-middle">
        <div className="bg-base-300 h-4 w-4 rounded-full" />
      </div>
      <div className="timeline-end flex flex-col font-mono text-xs opacity-60">
        <div className={classNames('text-xs font-bold', 'text-success')}>
          7:01am
          <sup>+1</sup>
        </div>
      </div>
    </li>
  </ul>
);
