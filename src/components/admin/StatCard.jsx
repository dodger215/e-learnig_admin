import React from 'react';
import { Card, Statistic, Space, Tooltip } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';

const StatCard = ({
  title,
  value,
  icon,
  color,
  trend,
  trendLabel,
  loading,
  tooltip,
  onClick
}) => {
  const getTrendIcon = () => {
    if (trend > 0) {
      return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
    } else if (trend < 0) {
      return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
    }
    return null;
  };

  const getTrendText = () => {
    if (trend > 0) {
      return `${Math.abs(trend)}% increase`;
    } else if (trend < 0) {
      return `${Math.abs(trend)}% decrease`;
    }
    return null;
  };

  return (
    <Card
      hoverable
      loading={loading}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s',
        borderRadius: '12px',
        border: `1px solid ${color}20`,
      }}
      className="hover-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 8
          }}>
            <span style={{
              fontSize: 14,
              color: '#666',
              marginRight: 4
            }}>
              {title}
            </span>
            {tooltip && (
              <Tooltip title={tooltip}>
                <InfoCircleOutlined style={{ color: '#999', fontSize: 12 }} />
              </Tooltip>
            )}
          </div>

          <Statistic
            value={value}
            styles={{
              content: {
                fontSize: 28,
                fontWeight: 600,
                color: color || '#1890ff'
              }
            }}
          />

          {trend !== undefined && (
            <div style={{
              marginTop: 8,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              color: trend > 0 ? '#52c41a' : trend < 0 ? '#ff4d4f' : '#999'
            }}>
              <Space size={4}>
                {getTrendIcon()}
                <span>{getTrendText()}</span>
                {trendLabel && <span style={{ color: '#999' }}>• {trendLabel}</span>}
              </Space>
            </div>
          )}
        </div>

        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          color: color || '#1890ff',
          transition: 'all 0.3s',
        }}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string,
  trend: PropTypes.number,
  trendLabel: PropTypes.string,
  loading: PropTypes.bool,
  tooltip: PropTypes.string,
  onClick: PropTypes.func,
};

StatCard.defaultProps = {
  color: '#1890ff',
  trend: 0,
  loading: false,
};

export default StatCard;