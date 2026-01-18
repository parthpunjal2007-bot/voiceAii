const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

class VideoProcessor {
  static async extractFrame(videoPath, timestamp = '00:00:01') {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(
        path.dirname(videoPath),
        `${uuidv4()}_thumbnail.jpg`
      );

      const ffmpeg = spawn('ffmpeg', [
        '-i', videoPath,
        '-ss', timestamp,
        '-vframes', '1',
        '-q:v', '2',
        outputPath
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      ffmpeg.on('error', reject);
    });
  }

  static async compressVideo(inputPath, outputPath, quality = 'medium') {
    const qualities = {
      low: '500k',
      medium: '1000k',
      high: '2000k'
    };

    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-c:v', 'libx264',
        '-b:v', qualities[quality] || '1000k',
        '-c:a', 'aac',
        '-b:a', '128k',
        outputPath
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      ffmpeg.on('error', reject);
    });
  }

  static async getVideoMetadata(videoPath) {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,duration,bit_rate,codec_name',
        '-of', 'json',
        videoPath
      ]);

      let output = '';
      ffprobe.stdout.on('data', (data) => output += data);

      ffprobe.on('close', (code) => {
        if (code === 0) {
          try {
            const metadata = JSON.parse(output);
            resolve(metadata.streams[0]);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`FFprobe exited with code ${code}`));
        }
      });

      ffprobe.on('error', reject);
    });
  }
}

module.exports = VideoProcessor;