import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Activity } from './activity.entity';

@Entity('gps_points')
@Index(['activityId', 'timestamp'])
@Index(['latitude', 'longitude'])
export class GPSPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Activity, (activity) => activity.gpsPoints, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @Column()
  activityId: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  /**
   * Elevation in meters above sea level
   */
  @Column({ type: 'decimal', precision: 8, scale: 1, nullable: true })
  elevationM: number;

  /**
   * Speed in km/h at this GPS point
   */
  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  speedKmh: number;

  /**
   * GPS accuracy in meters (horizontal dilution of precision)
   */
  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  accuracyM: number;

  /**
   * Bearing (compass direction) in degrees
   */
  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  bearingDegrees: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  /**
   * Domain: Calculate haversine distance to another GPS point (km)
   */
  distanceTo(other: GPSPoint): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(
      parseFloat(other.latitude.toString()) -
        parseFloat(this.latitude.toString()),
    );
    const dLon = this.toRad(
      parseFloat(other.longitude.toString()) -
        parseFloat(this.longitude.toString()),
    );
    const lat1 = this.toRad(parseFloat(this.latitude.toString()));
    const lat2 = this.toRad(parseFloat(other.latitude.toString()));

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) *
        Math.sin(dLon / 2) *
        Math.cos(lat1) *
        Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
