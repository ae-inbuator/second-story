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

interface RegistrationConfirmationEmailProps {
  guestName: string;
  eventDate: string;
  eventTime: string;
  spotNumber: number;
  totalSpots: number;
  chapterNumber: string;
}

export const RegistrationConfirmationEmail = ({
  guestName,
  eventDate,
  eventTime,
  spotNumber,
  totalSpots,
  chapterNumber = 'I',
}: RegistrationConfirmationEmailProps) => {
  const previewText = `Your spot is confirmed for Second Story Chapter ${chapterNumber}`;

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
            <Text style={greeting}>Perfect, {guestName}!</Text>
            <Text style={confirmation}>Your spot is confirmed.</Text>
            
            <Section style={detailsBox}>
              <Text style={eventDetails}>
                {eventDate} · {eventTime}
              </Text>
              <Text style={spotInfo}>
                Spot {spotNumber} of {totalSpots}
              </Text>
            </Section>

            <Text style={instruction}>
              Location details will be shared via WhatsApp 24 hours before the event.
            </Text>

            <Button
              style={button}
              href="https://secondstory.com/invite"
            >
              View Your Reservation
            </Button>

            <Section style={reminderSection}>
              <Text style={reminderTitle}>What to expect:</Text>
              <Text style={reminderItem}>• Exclusive runway presentation</Text>
              <Text style={reminderItem}>• Live wishlist experience</Text>
              <Text style={reminderItem}>• Champagne reception</Text>
              <Text style={reminderItem}>• Personal styling consultation</Text>
            </Section>

            <Text style={footer}>
              We look forward to seeing you at Second Story.
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

RegistrationConfirmationEmail.PreviewProps = {
  guestName: 'Isabella',
  eventDate: 'December 12, 2024',
  eventTime: '7:00 PM',
  spotNumber: 23,
  totalSpots: 50,
  chapterNumber: 'I',
} as RegistrationConfirmationEmailProps;

export default RegistrationConfirmationEmail;

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
  fontSize: '18px',
  fontWeight: '400',
  color: '#000000',
  marginBottom: '8px',
};

const confirmation = {
  fontSize: '24px',
  fontWeight: '300',
  color: '#000000',
  marginBottom: '32px',
};

const detailsBox = {
  backgroundColor: '#f9f9f9',
  padding: '24px',
  borderRadius: '4px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const eventDetails = {
  fontSize: '16px',
  fontWeight: '400',
  color: '#000000',
  margin: '0 0 8px 0',
  letterSpacing: '1px',
};

const spotInfo = {
  fontSize: '14px',
  color: '#666666',
  margin: '0',
  letterSpacing: '0.5px',
};

const instruction = {
  fontSize: '14px',
  color: '#666666',
  lineHeight: '24px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '0',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '400',
  letterSpacing: '2px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '16px 32px',
  marginBottom: '32px',
  textTransform: 'uppercase' as const,
};

const reminderSection = {
  borderTop: '1px solid #e6e6e6',
  paddingTop: '24px',
  marginTop: '32px',
};

const reminderTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#000000',
  marginBottom: '12px',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
};

const reminderItem = {
  fontSize: '14px',
  color: '#666666',
  lineHeight: '20px',
  margin: '4px 0',
};

const footer = {
  fontSize: '14px',
  color: '#666666',
  lineHeight: '24px',
  marginTop: '32px',
  textAlign: 'center' as const,
};

const signature = {
  fontSize: '14px',
  color: '#000000',
  fontStyle: 'italic',
  marginTop: '16px',
  textAlign: 'center' as const,
};