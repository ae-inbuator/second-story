import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface EventReminderEmailProps {
  guestName: string;
  eventDate: string;
  eventTime: string;
  hoursUntilEvent: number;
  location?: string;
  chapterNumber: string;
}

export const EventReminderEmail = ({
  guestName,
  eventDate,
  eventTime,
  hoursUntilEvent,
  location,
  chapterNumber = 'I',
}: EventReminderEmailProps) => {
  const previewText = `Second Story starts in ${hoursUntilEvent} hours`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>SECOND STORY</Heading>
            <Text style={subtitle}>Chapter {chapterNumber}</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Dear {guestName},</Text>
            
            <Section style={urgentBox}>
              <Text style={countdown}>
                {hoursUntilEvent === 24 ? 'Tomorrow' : `In ${hoursUntilEvent} hours`}
              </Text>
              <Text style={eventTime}>
                {eventDate} · {eventTime}
              </Text>
            </Section>

            {location && (
              <Section style={locationBox}>
                <Text style={locationTitle}>Location</Text>
                <Text style={locationAddress}>{location}</Text>
              </Section>
            )}

            <Button
              style={button}
              href="https://secondstory.com/invite"
            >
              Access Your Link
            </Button>

            <Section style={checklistSection}>
              <Text style={checklistTitle}>Before you arrive:</Text>
              <Text style={checklistItem}>✓ Charge your phone for the live experience</Text>
              <Text style={checklistItem}>✓ Arrive 15 minutes early for check-in</Text>
              <Text style={checklistItem}>✓ Dress code: Elegant evening</Text>
            </Section>

            <Text style={footer}>
              Can't wait to see you there.
            </Text>

            <Text style={signature}>
              — The Second Story Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

EventReminderEmail.PreviewProps = {
  guestName: 'Isabella',
  eventDate: 'December 12, 2024',
  eventTime: '7:00 PM',
  hoursUntilEvent: 24,
  location: 'The Vault, 123 Luxury Lane, New York',
  chapterNumber: 'I',
} as EventReminderEmailProps;

export default EventReminderEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
  maxWidth: '100%',
};

const header = {
  textAlign: 'center' as const,
  padding: '32px 0',
  borderBottom: '1px solid #e6e6e6',
};

const logo = {
  fontSize: '24px',
  fontWeight: '300',
  letterSpacing: '8px',
  color: '#000000',
  margin: '0',
  padding: '0',
};

const subtitle = {
  fontSize: '14px',
  fontWeight: '400',
  letterSpacing: '4px',
  color: '#666666',
  marginTop: '8px',
  textTransform: 'uppercase' as const,
};

const content = {
  padding: '32px 32px 0',
};

const greeting = {
  fontSize: '16px',
  fontWeight: '400',
  color: '#000000',
  marginBottom: '24px',
};

const urgentBox = {
  backgroundColor: '#000000',
  color: '#ffffff',
  padding: '24px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const countdown = {
  fontSize: '28px',
  fontWeight: '300',
  color: '#ffffff',
  margin: '0 0 8px 0',
  letterSpacing: '2px',
};

const eventTime = {
  fontSize: '16px',
  color: '#ffffff',
  margin: '0',
  letterSpacing: '1px',
};

const locationBox = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const locationTitle = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#666666',
  marginBottom: '8px',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
};

const locationAddress = {
  fontSize: '16px',
  color: '#000000',
  margin: '0',
  lineHeight: '24px',
};

const button = {
  backgroundColor: '#D4AF37',
  borderRadius: '0',
  color: '#000000',
  fontSize: '14px',
  fontWeight: '500',
  letterSpacing: '2px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '16px 32px',
  marginBottom: '32px',
  textTransform: 'uppercase' as const,
};

const checklistSection = {
  borderTop: '1px solid #e6e6e6',
  paddingTop: '24px',
  marginTop: '32px',
};

const checklistTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#000000',
  marginBottom: '12px',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
};

const checklistItem = {
  fontSize: '14px',
  color: '#666666',
  lineHeight: '24px',
  margin: '4px 0',
};

const footer = {
  fontSize: '14px',
  color: '#666666',
  lineHeight: '24px',
  marginTop: '32px',
  textAlign: 'center' as const,
  fontStyle: 'italic',
};

const signature = {
  fontSize: '14px',
  color: '#000000',
  marginTop: '16px',
  textAlign: 'center' as const,
};