import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded'
import { Button, Grid, Stack, Typography } from '@mui/material'
import { MetricTile } from '@/components/common/MetricTile'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'

const linkedInUrl = 'https://www.linkedin.com/in/ayush-jaipuriar/'
const portfolioUrl = 'https://ayush-jaipuriar.github.io/Personal-Portfolio/about'

export function AboutPage() {
  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="About"
        title="Forge exists to make disciplined execution easier to sustain."
        description="A personal execution OS built to keep planning, prep, training, and recovery visible in one honest operating surface."
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricTile
            eyebrow="Project posture"
            value="Personal OS"
            detail="Forge is designed as an execution system, not a generic productivity dashboard."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricTile
            eyebrow="Built for"
            value="Disciplined work"
            detail="Interview prep, daily execution, physical training, and recovery-aware planning."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricTile
            eyebrow="Developer"
            value="Ayush Jaipuriar"
            detail="Developer at TransUnion"
            tone="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 7 }}>
          <SurfaceCard
            eyebrow="Why Forge Exists"
            title="The project started as a way to make real execution easier to trust."
            description="Forge keeps the system honest enough that the next action, current pressure, and real progress stay visible without turning into noise."
          >
            <Typography color="text.secondary">
              It exists to reduce drift between planning and actual execution. Instead of scattering schedule,
              prep, training, and recovery across separate tools, Forge treats them as one operating system for
              disciplined work.
            </Typography>
          </SurfaceCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SurfaceCard
            eyebrow="About the Developer"
            title="Ayush Jaipuriar"
            description="Developer at TransUnion"
          >
            <Stack spacing={2}>
              <Typography color="text.secondary">
                Forge was built by Ayush Jaipuriar as a personal execution system that values structure, clarity,
                and honest feedback over generic productivity theater.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                <Button
                  component="a"
                  href={linkedInUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="contained"
                  endIcon={<LaunchRoundedIcon fontSize="small" />}
                >
                  LinkedIn
                </Button>
                <Button
                  component="a"
                  href={portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="outlined"
                  color="inherit"
                  endIcon={<LaunchRoundedIcon fontSize="small" />}
                >
                  Portfolio
                </Button>
              </Stack>
            </Stack>
          </SurfaceCard>
        </Grid>
      </Grid>

      <SurfaceCard
        eyebrow="Project Note"
        title="Built with care"
        description="A small page, but still part of the same execution system."
      >
        <Typography
          color="text.secondary"
          sx={{
            textAlign: { xs: 'left', md: 'center' },
            fontSize: { xs: '1rem', md: '1.05rem' },
          }}
        >
          Made with love by Ayush Jaipuriar for disciplined execution.
        </Typography>
      </SurfaceCard>
    </Stack>
  )
}
