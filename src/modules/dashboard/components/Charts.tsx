import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../../../shared/contexts/ThemeContext';

type ChartData = {
  name: string;
  [key: string]: string | number;
};

type LineChartProps = {
  data: ChartData[];
  lines: { key: string; name: string; color: string }[];
  height?: number;
};

type BarChartProps = {
  data: ChartData[];
  bars: { key: string; name: string; color: string }[];
  height?: number;
};

type AreaChartProps = {
  data: ChartData[];
  areas: { key: string; name: string; color: string }[];
  height?: number;
};

// Recharts recibe colores como atributos SVG (no admiten var()), por eso se replican los tokens de index.css.
function useChartPalette() {
  const { theme } = useTheme();
  if (theme === 'light') {
    return { grid: '#e2e8f0', tick: '#64748b', axis: '#cbd5e1', tooltip: '#ffffff', tooltipText: '#0f172a', tooltipBorder: '#e2e8f0' };
  }
  if (theme === 'dark') {
    return { grid: '#243049', tick: '#94a3b8', axis: '#364560', tooltip: '#131c2e', tooltipText: '#f1f5f9', tooltipBorder: '#364560' };
  }
  return { grid: '#232329', tick: '#a1a1aa', axis: '#383842', tooltip: '#121216', tooltipText: '#f4f4f5', tooltipBorder: '#383842' };
}

export function TrendLineChart({ data, lines, height = 300 }: LineChartProps) {
  const palette = useChartPalette();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: palette.tick }}
          tickLine={{ stroke: palette.axis }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: palette.tick }}
          tickLine={{ stroke: palette.axis }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: palette.tooltip,
            border: `1px solid ${palette.tooltipBorder}`,
            borderRadius: '8px',
            color: palette.tooltipText,
            fontSize: '12px'
          }}
        />
        <Legend
          wrapperStyle={{ color: palette.tick, fontSize: '12px' }}
          iconType="line"
        />
        {lines.map(line => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TrendBarChart({ data, bars, height = 300 }: BarChartProps) {
  const palette = useChartPalette();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: palette.tick }}
          tickLine={{ stroke: palette.axis }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: palette.tick }}
          tickLine={{ stroke: palette.axis }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: palette.tooltip,
            border: `1px solid ${palette.tooltipBorder}`,
            borderRadius: '8px',
            color: palette.tooltipText,
            fontSize: '12px'
          }}
        />
        <Legend
          wrapperStyle={{ color: palette.tick, fontSize: '12px' }}
          iconType="rect"
        />
        {bars.map(bar => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendAreaChart({ data, areas, height = 300 }: AreaChartProps) {
  const palette = useChartPalette();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          {areas.map(area => (
            <linearGradient key={`gradient-${area.key}`} id={`color-${area.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={area.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: palette.tick }}
          tickLine={{ stroke: palette.axis }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: palette.tick }}
          tickLine={{ stroke: palette.axis }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: palette.tooltip,
            border: `1px solid ${palette.tooltipBorder}`,
            borderRadius: '8px',
            color: palette.tooltipText,
            fontSize: '12px'
          }}
        />
        <Legend
          wrapperStyle={{ color: palette.tick, fontSize: '12px' }}
          iconType="rect"
        />
        {areas.map(area => (
          <Area
            key={area.key}
            type="monotone"
            dataKey={area.key}
            name={area.name}
            stroke={area.color}
            strokeWidth={2}
            fill={`url(#color-${area.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
