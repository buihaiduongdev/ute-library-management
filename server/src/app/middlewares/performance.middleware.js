/**
 * Middleware để đo thời gian response của API
 * Ghi log performance cho mỗi request
 */

const fs = require('fs');
const path = require('path');

// Lưu trữ performance logs
const performanceLogs = [];
const logFilePath = path.join(__dirname, '../../../performance.log');

const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Lưu lại hàm send gốc
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Override hàm send
  res.send = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logPerformance(req, res, duration);
    
    originalSend.call(this, data);
  };
  
  // Override hàm json
  res.json = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logPerformance(req, res, duration);
    
    originalJson.call(this, data);
  };
  
  next();
};

function logPerformance(req, res, duration) {
  const log = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode: res.statusCode,
    duration: duration, // milliseconds
    durationSeconds: (duration / 1000).toFixed(3) // seconds
  };
  
  performanceLogs.push(log);
  
  // Ghi vào file
  const logLine = `[${log.timestamp}] ${log.method} ${log.url} - ${log.statusCode} - ${log.durationSeconds}s (${log.duration}ms)\n`;
  fs.appendFileSync(logFilePath, logLine);
  
  // Log ra console nếu > 500ms
  if (duration > 500) {
    console.warn(`⚠️  SLOW API: ${log.method} ${log.url} took ${log.durationSeconds}s`);
  }
}

// Hàm lấy thống kê performance
function getPerformanceStats() {
  if (performanceLogs.length === 0) {
    return {
      totalRequests: 0,
      averageTime: 0,
      minTime: 0,
      maxTime: 0,
      slowRequests: 0
    };
  }
  
  const durations = performanceLogs.map(log => log.duration);
  const total = durations.reduce((sum, d) => sum + d, 0);
  const average = total / durations.length;
  const min = Math.min(...durations);
  const max = Math.max(...durations);
  const slowRequests = performanceLogs.filter(log => log.duration > 500).length;
  
  return {
    totalRequests: performanceLogs.length,
    averageTime: (average / 1000).toFixed(3) + 's',
    averageTimeMs: average.toFixed(2) + 'ms',
    minTime: (min / 1000).toFixed(3) + 's',
    maxTime: (max / 1000).toFixed(3) + 's',
    slowRequests: slowRequests,
    slowRequestsPercentage: ((slowRequests / performanceLogs.length) * 100).toFixed(2) + '%'
  };
}

// Hàm lấy chi tiết logs
function getPerformanceLogs(limit = 100) {
  return performanceLogs.slice(-limit);
}

// Hàm reset logs
function resetPerformanceLogs() {
  performanceLogs.length = 0;
  if (fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '');
  }
}

// Hàm lấy thống kê theo endpoint
function getStatsByEndpoint() {
  const endpointStats = {};
  
  performanceLogs.forEach(log => {
    const endpoint = `${log.method} ${log.url}`;
    
    if (!endpointStats[endpoint]) {
      endpointStats[endpoint] = {
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        durations: []
      };
    }
    
    const stats = endpointStats[endpoint];
    stats.count++;
    stats.totalDuration += log.duration;
    stats.minDuration = Math.min(stats.minDuration, log.duration);
    stats.maxDuration = Math.max(stats.maxDuration, log.duration);
    stats.durations.push(log.duration);
  });
  
  // Tính toán average và format
  const result = {};
  Object.keys(endpointStats).forEach(endpoint => {
    const stats = endpointStats[endpoint];
    result[endpoint] = {
      count: stats.count,
      averageTime: (stats.totalDuration / stats.count / 1000).toFixed(3) + 's',
      minTime: (stats.minDuration / 1000).toFixed(3) + 's',
      maxTime: (stats.maxDuration / 1000).toFixed(3) + 's',
      totalTime: (stats.totalDuration / 1000).toFixed(3) + 's'
    };
  });
  
  return result;
}

module.exports = {
  performanceMiddleware,
  getPerformanceStats,
  getPerformanceLogs,
  resetPerformanceLogs,
  getStatsByEndpoint
};





