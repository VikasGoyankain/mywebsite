import { NextRequest, NextResponse } from 'next/server';
import {
  getAllExpertiseAreas,
  createExpertiseArea,
} from '@/lib/services/expertise-areas-service';
import {
  getAllCertifications,
  createCertification,
} from '@/lib/services/certifications-service';
import {
  getAllCompetitions,
  createCompetition,
} from '@/lib/services/competitions-service';
import type { ExpertiseArea, Certification, Competition } from '@/types/expertise';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expertiseAreas, certifications, competitions } = body;

    console.log('Migration request received:', {
      areasCount: expertiseAreas?.length || 0,
      certsCount: certifications?.length || 0,
      compsCount: competitions?.length || 0,
    });

    // Check if data already exists
    const [existingAreas, existingCerts, existingComps] = await Promise.all([
      getAllExpertiseAreas(),
      getAllCertifications(),
      getAllCompetitions(),
    ]);

    console.log('Existing data in Redis:', {
      existingAreas: existingAreas.length,
      existingCerts: existingCerts.length,
      existingComps: existingComps.length,
    });

    const results = {
      expertiseAreas: { migrated: 0, skipped: 0 },
      certifications: { migrated: 0, skipped: 0 },
      competitions: { migrated: 0, skipped: 0 },
      errors: [] as string[],
    };

    // Migrate expertise areas
    if (expertiseAreas && Array.isArray(expertiseAreas)) {
      for (const area of expertiseAreas) {
        try {
          // Check if already exists
          if (existingAreas.some(a => a.id === area.id)) {
            results.expertiseAreas.skipped++;
            continue;
          }
          
          const { id, createdAt, ...areaData } = area;
          await createExpertiseArea(areaData, id); // Preserve original ID
          results.expertiseAreas.migrated++;
        } catch (error) {
          results.errors.push(`Failed to migrate area: ${area.name}`);
          console.error('Error migrating expertise area:', error);
        }
      }
    }

    // Migrate certifications
    if (certifications && Array.isArray(certifications)) {
      for (const cert of certifications) {
        try {
          // Check if already exists
          if (existingCerts.some(c => c.id === cert.id)) {
            results.certifications.skipped++;
            continue;
          }
          
          const { id, createdAt, ...certData } = cert;
          await createCertification(certData, id); // Preserve original ID
          results.certifications.migrated++;
        } catch (error) {
          results.errors.push(`Failed to migrate certification: ${cert.name}`);
          console.error('Error migrating certification:', error);
        }
      }
    }

    // Migrate competitions
    if (competitions && Array.isArray(competitions)) {
      for (const comp of competitions) {
        try {
          // Check if already exists
          if (existingComps.some(c => c.id === comp.id)) {
            results.competitions.skipped++;
            continue;
          }
          
          const { id, createdAt, ...compData } = comp;
          await createCompetition(compData, id); // Preserve original ID
          results.competitions.migrated++;
        } catch (error) {
          results.errors.push(`Failed to migrate competition: ${comp.name}`);
          console.error('Error migrating competition:', error);
        }
      }
    }

    const totalMigrated = results.expertiseAreas.migrated + results.certifications.migrated + results.competitions.migrated;
    const totalSkipped = results.expertiseAreas.skipped + results.certifications.skipped + results.competitions.skipped;
    
    console.log('Migration results:', results);
    
    return NextResponse.json({
      success: true,
      message: `Migration complete: ${totalMigrated} items migrated, ${totalSkipped} already existed`,
      results,
    });
  } catch (error) {
    console.error('Error in POST /api/expertise/migrate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to migrate expertise data', details: errorMessage },
      { status: 500 }
    );
  }
}
