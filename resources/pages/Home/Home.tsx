import { Avatar, Stats } from 'react-daisyui';

export const Home = (): JSX.Element => (
  <div className="text-center">
    <Stats className="shadow font-sans">
      <Stats.Stat>
        <Stats.Stat.Item variant="figure" className="text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-8 h-8 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            ></path>
          </svg>
        </Stats.Stat.Item>
        <Stats.Stat.Item variant="title">Total Likes</Stats.Stat.Item>
        <Stats.Stat.Item variant="value" className="text-primary">
          25.6K
        </Stats.Stat.Item>
        <Stats.Stat.Item variant="desc">
          21% more than last month
        </Stats.Stat.Item>
      </Stats.Stat>

      <Stats.Stat>
        <Stats.Stat.Item variant="figure" className="text-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-8 h-8 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            ></path>
          </svg>
        </Stats.Stat.Item>
        <Stats.Stat.Item variant="title">Page Views</Stats.Stat.Item>
        <Stats.Stat.Item variant="value" className="text-secondary">
          2.6M
        </Stats.Stat.Item>
        <Stats.Stat.Item variant="desc">
          21% more than last month
        </Stats.Stat.Item>
      </Stats.Stat>

      <Stats.Stat>
        <Stats.Stat.Item variant="figure" className="text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-8 h-8 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            ></path>
          </svg>
        </Stats.Stat.Item>
        <Stats.Stat.Item variant="figure" className=" text-secondary">
          <Avatar
            size="sm"
            online={true}
            src="https://api.lorem.space/image/face?w=128&h=128"
            shape="circle"
          ></Avatar>
        </Stats.Stat.Item>
        <Stats.Stat.Item variant="value">86%</Stats.Stat.Item>
        <Stats.Stat.Item variant="title">Tasks done</Stats.Stat.Item>
        <Stats.Stat.Item variant="desc" className="text-secondary">
          31 tasks remaining
        </Stats.Stat.Item>
      </Stats.Stat>
    </Stats>
  </div>
);
