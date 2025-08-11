import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Button,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface WishlistItem {
  name: string;
  brand: string;
  price: number;
  position: number;
  imageUrl?: string;
}

interface WishlistSummaryEmailProps {
  guestName: string;
  items: WishlistItem[];
  totalItems: number;
  chapterNumber: string;
}

export const WishlistSummaryEmail = ({
  guestName,
  items,
  totalItems,
  chapterNumber = 'I',
}: WishlistSummaryEmailProps) => {
  const previewText = `Your Second Story wishlist - ${totalItems} items`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>SECOND STORY</Heading>
            <Text style={subtitle}>Chapter {chapterNumber} · Wishlist Summary</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Thank you, {guestName}</Text>
            <Text style={intro}>
              The show has ended. Here's your curated wishlist from tonight's presentation.
            </Text>
            
            <Section style={statsBox}>
              <Text style={statsText}>
                {totalItems} items wished
              </Text>
            </Section>

            <Section style={itemsSection}>
              {items.map((item, index) => (
                <Section key={index} style={itemCard}>
                  <Row>
                    {item.imageUrl && (
                      <Column width="120">
                        <Img
                          src={item.imageUrl}
                          alt={item.name}
                          style={itemImage}
                        />
                      </Column>
                    )}
                    <Column>
                      <Text style={brandName}>{item.brand}</Text>
                      <Text style={itemName}>{item.name}</Text>
                      <Text style={itemPrice}>${item.price.toLocaleString()}</Text>
                      <Text style={queuePosition}>
                        Queue Position: {item.position === 1 ? '1st ✓' : `#${item.position}`}
                      </Text>
                    </Column>
                  </Row>
                </Section>
              ))}
            </Section>

            <Section style={nextStepsSection}>
              <Text style={sectionTitle}>What happens next?</Text>
              <Text style={stepItem}>
                1. Our team will contact you in order of queue position
              </Text>
              <Text style={stepItem}>
                2. You'll have 24 hours to confirm your selections
              </Text>
              <Text style={stepItem}>
                3. Personal consultation for sizing and styling
              </Text>
              <Text style={stepItem}>
                4. White glove delivery within 3-5 days
              </Text>
            </Section>

            <Button
              style={button}
              href="https://secondstory.com/show"
            >
              View Full Wishlist
            </Button>

            <Text style={footer}>
              Thank you for joining us at Second Story Chapter {chapterNumber}.
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

WishlistSummaryEmail.PreviewProps = {
  guestName: 'Isabella',
  items: [
    {
      name: 'Cassette Bag',
      brand: 'Bottega Veneta',
      price: 2850,
      position: 1,
      imageUrl: 'https://example.com/bag.jpg',
    },
    {
      name: 'Max Mara Coat',
      brand: 'Max Mara',
      price: 3200,
      position: 2,
      imageUrl: 'https://example.com/coat.jpg',
    },
  ],
  totalItems: 8,
  chapterNumber: 'I',
} as WishlistSummaryEmailProps;

export default WishlistSummaryEmail;

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
  fontSize: '20px',
  fontWeight: '400',
  color: '#000000',
  marginBottom: '8px',
};

const intro = {
  fontSize: '14px',
  color: '#666666',
  lineHeight: '24px',
  marginBottom: '24px',
};

const statsBox = {
  backgroundColor: '#000000',
  color: '#ffffff',
  padding: '16px',
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const statsText = {
  fontSize: '16px',
  fontWeight: '300',
  color: '#ffffff',
  margin: '0',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
};

const itemsSection = {
  marginBottom: '32px',
};

const itemCard = {
  borderBottom: '1px solid #e6e6e6',
  paddingBottom: '20px',
  marginBottom: '20px',
};

const itemImage = {
  width: '100px',
  height: '100px',
  objectFit: 'cover' as const,
};

const brandName = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#666666',
  marginBottom: '4px',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
};

const itemName = {
  fontSize: '16px',
  fontWeight: '400',
  color: '#000000',
  marginBottom: '8px',
};

const itemPrice = {
  fontSize: '18px',
  fontWeight: '300',
  color: '#000000',
  marginBottom: '8px',
};

const queuePosition = {
  fontSize: '14px',
  color: '#D4AF37',
  fontWeight: '500',
};

const nextStepsSection = {
  backgroundColor: '#f9f9f9',
  padding: '24px',
  marginBottom: '32px',
};

const sectionTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#000000',
  marginBottom: '16px',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
};

const stepItem = {
  fontSize: '14px',
  color: '#666666',
  lineHeight: '24px',
  margin: '8px 0',
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